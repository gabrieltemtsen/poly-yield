/**
 * PolyYield AI Oracle
 *
 * Monitors yield strategies across Polkadot parachains, uses Gemini AI
 * to analyze opportunities, and calls vault.rebalance() when a better
 * strategy is found.
 */

import { ethers } from "ethers";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "../.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────

const RPC_URL = process.env.POLKADOT_HUB_RPC || "https://testnet-passet-hub-eth-rpc.polkadot.io";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHECK_INTERVAL_MS = parseInt(process.env.CHECK_INTERVAL_MS || "300000"); // 5 min

// ── Load deployment ──────────────────────────────────────────────────────────

const deployment = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../deployments/latest.json"), "utf-8")
);

const VAULT_ABI = [
  "function allStrategies() view returns (string[] names, string[] protocols, uint256[] apys, uint256[] assets)",
  "function activeStrategy() view returns (string name, string protocol, uint256 apy, uint256 assets)",
  "function activeStrategyIndex() view returns (uint256)",
  "function rebalance(uint256 newStrategyIndex, string reason) external",
  "function lastRebalanceTime() view returns (uint256)",
  "event Rebalanced(uint256 fromIndex, uint256 toIndex, string reason)",
];

// ── Telegram ─────────────────────────────────────────────────────────────────

async function notify(msg) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: msg,
      parse_mode: "Markdown",
    }),
  }).catch(console.error);
}

// ── Gemini AI Analysis ────────────────────────────────────────────────────────

async function analyzeWithAI(strategies, currentIndex) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const strategyList = strategies.names
    .map(
      (name, i) =>
        `${i === currentIndex ? "★ ACTIVE" : "  "} [${i}] ${name} (${strategies.protocols[i]}): APY=${(Number(strategies.apys[i]) / 100).toFixed(2)}%, AUM=$${(Number(strategies.assets[i]) / 1e6).toFixed(2)}`
    )
    .join("\n");

  const prompt = `
You are the AI oracle for PolyYield, a cross-parachain yield aggregator on Polkadot Hub.

Current yield strategies:
${strategyList}

Current active strategy index: ${currentIndex}

Analyze these yield opportunities and decide if we should rebalance. Consider:
1. APY differential (is the gain worth the rebalance gas cost?)
2. AUM (larger pools are generally safer)
3. Only recommend rebalancing if APY improvement is >100bps (1%)

Respond in this exact JSON format:
{
  "shouldRebalance": true/false,
  "recommendedIndex": <number>,
  "reason": "<brief explanation under 100 chars>",
  "confidence": "high/medium/low"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned invalid JSON: " + text);

  return JSON.parse(jsonMatch[0]);
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function checkAndRebalance() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const vault = new ethers.Contract(deployment.PolyYieldVault, VAULT_ABI, wallet);

  console.log(`\n[${new Date().toISOString()}] Checking yield strategies...`);

  // Fetch on-chain data
  const strategies = await vault.allStrategies();
  const currentIndex = Number(await vault.activeStrategyIndex());
  const lastRebalance = Number(await vault.lastRebalanceTime());

  const now = Math.floor(Date.now() / 1000);
  const cooldownLeft = Math.max(0, lastRebalance + 3600 - now);

  if (cooldownLeft > 0) {
    console.log(`  ⏳ Cooldown active: ${Math.floor(cooldownLeft / 60)}m remaining`);
    return;
  }

  // Log current state
  console.log("  Strategies:");
  for (let i = 0; i < strategies.names.length; i++) {
    const active = i === currentIndex ? " ← ACTIVE" : "";
    console.log(
      `    [${i}] ${strategies.names[i]} (${strategies.protocols[i]}): ` +
        `${(Number(strategies.apys[i]) / 100).toFixed(2)}% APY${active}`
    );
  }

  // Ask AI
  console.log("  🤖 Consulting Gemini AI...");
  const decision = await analyzeWithAI(strategies, currentIndex);
  console.log(`  AI Decision: shouldRebalance=${decision.shouldRebalance}, confidence=${decision.confidence}`);
  console.log(`  Reason: ${decision.reason}`);

  if (decision.shouldRebalance && decision.recommendedIndex !== currentIndex) {
    const fromName = strategies.names[currentIndex];
    const toName = strategies.names[decision.recommendedIndex];
    const fromAPY = (Number(strategies.apys[currentIndex]) / 100).toFixed(2);
    const toAPY = (Number(strategies.apys[decision.recommendedIndex]) / 100).toFixed(2);

    console.log(`  🔄 Rebalancing: ${fromName} → ${toName}`);

    const tx = await vault.rebalance(decision.recommendedIndex, decision.reason);
    await tx.wait();

    console.log(`  ✅ Rebalanced! TX: ${tx.hash}`);

    await notify(
      `⚡ *PolyYield Rebalanced*\n\n` +
        `From: ${fromName} (${fromAPY}% APY)\n` +
        `To: ${toName} (${toAPY}% APY)\n\n` +
        `AI Reason: _${decision.reason}_\n` +
        `TX: \`${tx.hash}\``
    );
  } else {
    const activeName = strategies.names[currentIndex];
    const activeAPY = (Number(strategies.apys[currentIndex]) / 100).toFixed(2);
    console.log(
      `  ✓ No rebalance needed. Staying on ${activeName} (${activeAPY}% APY)`
    );
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────

console.log("🚀 PolyYield AI Oracle starting...");
console.log(`   Vault: ${deployment.PolyYieldVault}`);
console.log(`   RPC:   ${RPC_URL}`);
console.log(`   Check interval: ${CHECK_INTERVAL_MS / 1000}s`);

// Run immediately, then on interval
checkAndRebalance().catch(console.error);
setInterval(() => checkAndRebalance().catch(console.error), CHECK_INTERVAL_MS);

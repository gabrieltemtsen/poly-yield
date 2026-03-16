"use client";

import { WalletButton } from "@/components/WalletButton";
import { VaultStats } from "@/components/VaultStats";
import { StrategyTable } from "@/components/StrategyTable";
import { DepositWithdraw } from "@/components/DepositWithdraw";
import { AIOracle } from "@/components/AIOracle";
import { DEPLOYMENT } from "@/lib/contracts";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">PolyYield</h1>
              <p className="text-xs text-gray-500">AI-Powered Cross-Parachain Yield</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`${DEPLOYMENT.explorer}/address/${DEPLOYMENT.contracts.PolyYieldVault}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-pink-400 transition-colors hidden md:block"
            >
              Contract ↗
            </a>
            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full hidden md:block">
              Polkadot Hub Testnet
            </span>
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Your stablecoins,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  always earning the most
                </span>
              </h2>
              <p className="text-gray-400 max-w-xl">
                Deposit USDC and let our Gemini AI oracle automatically route your funds to
                the highest-yielding strategy across Polkadot parachains — Bifrost, Acala, HydraDX.
                No manual management needed.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a
                href="https://github.com/gabrieltemtsen/poly-yield"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 text-sm rounded-lg transition-colors"
              >
                GitHub ↗
              </a>
              <a
                href="https://dorahacks.io/hackathon/polkadot-solidity-hackathon/detail"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-pink-500/40 text-pink-400 hover:bg-pink-500/10 text-sm rounded-lg transition-colors"
              >
                DoraHacks Submission
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <VaultStats />

        {/* 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: strategies + AI oracle */}
          <div className="lg:col-span-2 space-y-6">
            <StrategyTable />
            <AIOracle />
          </div>

          {/* Right: deposit/withdraw */}
          <div className="lg:col-span-1">
            <DepositWithdraw />
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="font-semibold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Deposit USDC", desc: "Your stablecoins enter the PolyYieldVault smart contract on Polkadot Hub" },
              { step: "2", title: "Auto-Routed", desc: "Funds go to the current best-yield strategy across Polkadot parachains" },
              { step: "3", title: "AI Monitors", desc: "Gemini AI checks APY rates every 5 minutes and recommends rebalancing" },
              { step: "4", title: "Yield Accrues", desc: "Withdraw anytime with earned yield — your shares are worth more over time" },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 py-4">
          Built for the{" "}
          <a href="https://dorahacks.io/hackathon/polkadot-solidity-hackathon/detail" className="text-pink-500 hover:underline" target="_blank">
            Polkadot Solidity Hackathon 2026
          </a>{" "}
          · Vault: <a href={`${DEPLOYMENT.explorer}/address/${DEPLOYMENT.contracts.PolyYieldVault}`} className="font-mono hover:text-gray-400 transition-colors" target="_blank">
            {DEPLOYMENT.contracts.PolyYieldVault.slice(0, 10)}...
          </a>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useReadContract } from "wagmi";
import { DEPLOYMENT, VAULT_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";

export function VaultStats() {
  const { data: activeStrategy } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "activeStrategy",
  });

  const { data: totalAssets } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "totalAssets",
  });

  const { data: totalSupply } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "totalSupply",
  });

  const { data: lastRebalance } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "lastRebalanceTime",
  });

  const apy = activeStrategy ? Number(activeStrategy[2]) / 100 : 0;
  const tvl = totalAssets ? parseFloat(formatUnits(totalAssets, 6)) : 0;
  const shares = totalSupply ? parseFloat(formatUnits(totalSupply, 18)) : 0;
  const lastRebalanceDate = lastRebalance && Number(lastRebalance) > 0
    ? new Date(Number(lastRebalance) * 1000).toLocaleString()
    : "Never";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Current APY"
        value={`${apy.toFixed(2)}%`}
        sub="Auto-optimized"
        highlight
      />
      <StatCard
        label="Total Value Locked"
        value={`$${tvl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        sub="USDC"
      />
      <StatCard
        label="Vault Shares"
        value={shares.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        sub="pyUSDC"
      />
      <StatCard
        label="Last Rebalance"
        value={lastRebalanceDate === "Never" ? "Never" : lastRebalanceDate.split(",")[1]?.trim() || lastRebalanceDate}
        sub={lastRebalanceDate === "Never" ? "Awaiting AI" : lastRebalanceDate.split(",")[0]}
      />
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: {
  label: string; value: string; sub: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 border ${highlight ? "border-pink-500/40 bg-pink-500/10" : "border-gray-800 bg-gray-900"}`}>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-pink-400" : "text-white"}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

"use client";

import { useReadContract } from "wagmi";
import { DEPLOYMENT, VAULT_ABI } from "@/lib/contracts";

export function AIOracle() {
  const { data: activeStrategy } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "activeStrategy",
  });

  const { data: allStrategies } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "allStrategies",
  });

  const { data: lastRebalance } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "lastRebalanceTime",
  });

  const currentAPY = activeStrategy ? Number(activeStrategy[2]) / 100 : 0;
  const apys = allStrategies?.[2] ?? [];
  const names = allStrategies?.[0] ?? [];
  const maxAPY = apys.length > 0 ? Math.max(...apys.map(a => Number(a))) / 100 : 0;
  const bestIdx = apys.findIndex(a => Number(a) === Math.max(...apys.map(x => Number(x))));
  const bestName = names[bestIdx] ?? "";
  const shouldRebalance = maxAPY - currentAPY > 1;

  const now = Math.floor(Date.now() / 1000);
  const cooldownLeft = lastRebalance ? Math.max(0, Number(lastRebalance) + 3600 - now) : 0;
  const canRebalance = cooldownLeft === 0;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h2 className="font-semibold text-white">AI Oracle Status</h2>
        <div className={`ml-auto flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
          shouldRebalance ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${shouldRebalance ? "bg-yellow-400" : "bg-green-400"}`} />
          {shouldRebalance ? "Rebalance Pending" : "Optimal"}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Analysis</p>
          {shouldRebalance ? (
            <p className="text-sm text-yellow-300">
              ⚡ <strong>{bestName}</strong> offers {(maxAPY - currentAPY).toFixed(2)}% higher APY than current strategy.
              {canRebalance
                ? " Rebalance will execute on next oracle check."
                : ` Cooldown: ${Math.floor(cooldownLeft / 60)}m remaining.`}
            </p>
          ) : (
            <p className="text-sm text-green-300">
              ✓ Current strategy is optimal. APY gap between strategies is &lt;1%. No rebalance needed.
            </p>
          )}
        </div>

        {/* Strategy APY comparison */}
        <div className="space-y-2">
          {names.map((name, i) => {
            const apy = Number(apys[i]) / 100;
            const pct = maxAPY > 0 ? (apy / maxAPY) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{name}</span>
                  <span className="text-white font-medium">{apy.toFixed(2)}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      i === bestIdx ? "bg-green-400" : "bg-gray-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Oracle info */}
        <div className="text-xs text-gray-500 flex gap-4 pt-2 border-t border-gray-800">
          <span>Powered by Gemini 2.0 Flash</span>
          <span>·</span>
          <span>Checks every 5 minutes</span>
          <span>·</span>
          <span>1h cooldown between rebalances</span>
        </div>
      </div>
    </div>
  );
}

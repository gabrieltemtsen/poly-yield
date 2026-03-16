"use client";

import { useReadContract } from "wagmi";
import { DEPLOYMENT, VAULT_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";

const PROTOCOL_COLORS: Record<string, string> = {
  "Bifrost Finance": "bg-purple-500/20 text-purple-300",
  "Acala Network": "bg-red-500/20 text-red-300",
  "HydraDX": "bg-blue-500/20 text-blue-300",
};

export function StrategyTable() {
  const { data: allStrategies, isLoading } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "allStrategies",
  });

  const { data: activeIndex } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "activeStrategyIndex",
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="animate-pulse space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-12 bg-gray-800 rounded" />)}
        </div>
      </div>
    );
  }

  const names = allStrategies?.[0] ?? [];
  const protocols = allStrategies?.[1] ?? [];
  const apys = allStrategies?.[2] ?? [];
  const assets = allStrategies?.[3] ?? [];

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-white">Yield Strategies</h2>
        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          🤖 AI-managed
        </span>
      </div>
      <div className="divide-y divide-gray-800">
        {names.map((name, i) => {
          const apy = Number(apys[i]) / 100;
          const tvl = parseFloat(formatUnits(assets[i], 6));
          const isActive = Number(activeIndex) === i;
          const bestAPY = Math.max(...apys.map(a => Number(a)));
          const isBest = Number(apys[i]) === bestAPY;

          return (
            <div
              key={i}
              className={`px-6 py-4 flex items-center justify-between transition-colors ${
                isActive ? "bg-pink-500/5 border-l-2 border-l-pink-500" : "hover:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{name}</span>
                    {isActive && (
                      <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full font-medium">
                        ● ACTIVE
                      </span>
                    )}
                    {isBest && !isActive && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">
                        BEST APY
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${PROTOCOL_COLORS[protocols[i]] ?? "bg-gray-700 text-gray-300"}`}>
                    {protocols[i]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-8 text-right">
                <div>
                  <p className={`text-lg font-bold ${isBest ? "text-green-400" : "text-white"}`}>
                    {apy.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">APY</p>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">
                    ${tvl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">TVL</p>
                </div>
                <div>
                  <a
                    href={`${DEPLOYMENT.explorer}/address/${DEPLOYMENT.strategies[i]?.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-pink-400 transition-colors"
                  >
                    {DEPLOYMENT.strategies[i]?.address.slice(0, 6)}...{DEPLOYMENT.strategies[i]?.address.slice(-4)} ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

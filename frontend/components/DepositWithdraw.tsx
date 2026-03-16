"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { DEPLOYMENT, VAULT_ABI, ERC20_ABI } from "@/lib/contracts";

export function DepositWithdraw() {
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // User balances
  const { data: usdcBalance, refetch: refetchUSDC } = useReadContract({
    address: DEPLOYMENT.contracts.MockUSDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: sharesBalance, refetch: refetchShares } = useReadContract({
    address: DEPLOYMENT.contracts.PolyYieldVault,
    abi: VAULT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: DEPLOYMENT.contracts.MockUSDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, DEPLOYMENT.contracts.PolyYieldVault] : undefined,
    query: { enabled: !!address },
  });

  const usdcFormatted = usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)) : 0;
  const sharesFormatted = sharesBalance ? parseFloat(formatUnits(sharesBalance, 18)) : 0;
  const amountParsed = amount ? parseUnits(amount, tab === "deposit" ? 6 : 18) : 0n;
  const needsApproval = tab === "deposit" && allowance !== undefined && amountParsed > 0n && allowance < amountParsed;

  const handleFaucet = () => {
    writeContract({
      address: DEPLOYMENT.contracts.MockUSDC,
      abi: ERC20_ABI,
      functionName: "faucet",
      args: [1000n * 1_000_000n], // 1000 USDC
    });
  };

  const handleApprove = () => {
    writeContract({
      address: DEPLOYMENT.contracts.MockUSDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [DEPLOYMENT.contracts.PolyYieldVault, amountParsed],
    });
  };

  const handleDeposit = () => {
    writeContract({
      address: DEPLOYMENT.contracts.PolyYieldVault,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [amountParsed],
    });
  };

  const handleWithdraw = () => {
    writeContract({
      address: DEPLOYMENT.contracts.PolyYieldVault,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amountParsed],
    });
  };

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
        <p className="text-gray-400">Connect your wallet to deposit or withdraw</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="font-semibold text-white">Your Position</h2>
      </div>

      {/* Balances */}
      <div className="px-6 py-4 flex gap-4 border-b border-gray-800">
        <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">USDC Balance</p>
          <p className="text-lg font-bold text-white">${usdcFormatted.toFixed(2)}</p>
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500">pyUSDC Shares</p>
          <p className="text-lg font-bold text-pink-400">{sharesFormatted.toFixed(4)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["deposit", "withdraw"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? "text-pink-400 border-b-2 border-pink-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">
            {tab === "deposit" ? "USDC Amount" : "pyUSDC Shares"}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-pink-500 pr-20"
            />
            <button
              onClick={() => setAmount(tab === "deposit" ? usdcFormatted.toString() : sharesFormatted.toString())}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-400 hover:text-pink-300"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {tab === "deposit" ? (
          <div className="space-y-2">
            {needsApproval && (
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming || !amount}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isPending || isConfirming ? "Approving..." : "1. Approve USDC"}
              </button>
            )}
            <button
              onClick={handleDeposit}
              disabled={isPending || isConfirming || !amount || needsApproval}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isPending || isConfirming ? "Depositing..." : needsApproval ? "2. Deposit USDC" : "Deposit USDC"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={isPending || isConfirming || !amount}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isPending || isConfirming ? "Withdrawing..." : "Withdraw"}
          </button>
        )}

        {isSuccess && (
          <div className="text-center text-green-400 text-sm">
            ✅ Transaction confirmed!{" "}
            <a href={`${DEPLOYMENT.explorer}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
              View on explorer ↗
            </a>
          </div>
        )}

        {/* Faucet */}
        <div className="pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">Need test USDC?</p>
          <button
            onClick={handleFaucet}
            disabled={isPending || isConfirming}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm rounded-lg transition-colors"
          >
            🚰 Get 1,000 USDC from Faucet
          </button>
        </div>
      </div>
    </div>
  );
}

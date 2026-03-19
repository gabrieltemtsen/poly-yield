"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { polkadotHubTestnet } from "@/lib/wagmi";
import { injected } from "wagmi/connectors";

export function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== polkadotHubTestnet.id;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: polkadotHubTestnet.id })}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
      >
        Switch Network
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-sm font-mono text-gray-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>
      <button
        onClick={() => disconnect()}
        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}

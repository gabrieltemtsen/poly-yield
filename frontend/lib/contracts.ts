export const DEPLOYMENT = {
  network: "Polkadot Hub Testnet",
  chainId: 420420417,
  rpc: "https://eth-rpc-testnet.polkadot.io/",
  explorer: "https://blockscout-testnet.polkadot.io",
  contracts: {
    MockUSDC: "0x64A9E8425f8a219B5D0a843c531CFa2D2fA891D8" as `0x${string}`,
    PolyYieldVault: "0xF112ba99A3586Ac4b5dA4148c0a03ADD2C6BFA0a" as `0x${string}`,
  },
  strategies: [
    { name: "Bifrost vDOT Pool", protocol: "Bifrost Finance", apy: 850, address: "0x1148120c28a9597Efe77BaaE01989129406966A0" as `0x${string}` },
    { name: "Acala aUSD Lending", protocol: "Acala Network", apy: 1200, address: "0xfc8Ed811Cf99F68cda81D99142def5E85c264fA3" as `0x${string}` },
    { name: "HydraDX Omnipool", protocol: "HydraDX", apy: 650, address: "0xeFCF8927961aCd0A157d84eba539D0E9B0849127" as `0x${string}` },
  ],
};

export const VAULT_ABI = [
  {
    "inputs": [],
    "name": "activeStrategy",
    "outputs": [
      { "internalType": "string", "name": "stratName", "type": "string" },
      { "internalType": "string", "name": "protocol", "type": "string" },
      { "internalType": "uint256", "name": "apy", "type": "uint256" },
      { "internalType": "uint256", "name": "assets", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "activeStrategyIndex",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allStrategies",
    "outputs": [
      { "internalType": "string[]", "name": "names", "type": "string[]" },
      { "internalType": "string[]", "name": "protocols", "type": "string[]" },
      { "internalType": "uint256[]", "name": "apys", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "assets", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAssets",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }],
    "name": "deposit",
    "outputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [{ "internalType": "uint256", "name": "assets", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
    "name": "previewWithdraw",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastRebalanceTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "fromIndex", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "toIndex", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "Rebalanced",
    "type": "event"
  },
] as const;

export const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

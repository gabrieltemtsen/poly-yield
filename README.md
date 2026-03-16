# PolyYield ⚡

> AI-powered cross-parachain yield aggregator on Polkadot Hub

PolyYield automatically routes your stablecoins to the highest-yielding strategy across Polkadot parachains. An on-chain vault manages your funds; an off-chain Gemini AI oracle monitors yield rates and calls `rebalance()` when a better opportunity is found — no manual intervention needed.

---

## How It Works

```
User deposits USDC
      ↓
PolyYieldVault (Polkadot Hub EVM)
      ↓
Active Strategy (Bifrost / Acala / HydraDX)
      ↑
AI Oracle (Gemini) ─ checks every 5min ─ rebalances when APY gap > 1%
```

## Architecture

| Component | Description |
|-----------|-------------|
| `PolyYieldVault.sol` | ERC20 vault — users deposit/withdraw, oracle rebalances |
| `IYieldStrategy.sol` | Interface for pluggable yield strategies |
| `MockStrategy.sol` | Testnet strategy simulating parachain yield pools |
| `MockUSDC.sol` | Faucet stablecoin for testnet demos |
| `oracle/index.js` | Gemini AI oracle — monitors + triggers rebalances |

## Strategies (Testnet)

| Strategy | Protocol | APY |
|----------|----------|-----|
| Bifrost vDOT Pool | Bifrost Finance | 8.5% |
| Acala aUSD Lending | Acala Network | 12.0% |
| HydraDX Omnipool | HydraDX | 6.5% |

## Quick Start

### 1. Setup
```bash
cp .env.example .env
# Fill in PRIVATE_KEY, GEMINI_API_KEY
```

### 2. Get testnet tokens
- Get WND/ROC for gas: [Polkadot Faucet](https://faucet.polkadot.io)
- RPC: `https://testnet-passet-hub-eth-rpc.polkadot.io`
- Chain ID: `420420421`

### 3. Deploy contracts
```bash
forge script script/Deploy.s.sol --rpc-url polkadotHub --broadcast --verify
```

### 4. Run AI oracle
```bash
cd oracle && npm install && npm start
```

## Polkadot Hackathon

Built for the **Polkadot Solidity Hackathon 2026** — Track 1: EVM Smart Contracts (DeFi & Stablecoin-enabled dApps).

**Why Polkadot?**
- Polkadot Hub is EVM-compatible — deploy Solidity, no chain migration
- XCM enables future cross-parachain fund movement natively
- Multiple DeFi protocols (Bifrost, Acala, HydraDX) = real yield diversity

## License

MIT

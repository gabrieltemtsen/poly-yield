require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    polkadotHub: {
      url: process.env.POLKADOT_HUB_RPC || "https://testnet-passet-hub-eth-rpc.polkadot.io",
      chainId: 420420421,
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

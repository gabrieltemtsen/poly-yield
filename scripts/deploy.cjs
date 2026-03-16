const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy MockUSDC
  console.log("\n📦 Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("MockUSDC:", await usdc.getAddress());

  // 2. Deploy PolyYieldVault
  console.log("\n🏦 Deploying PolyYieldVault...");
  const PolyYieldVault = await hre.ethers.getContractFactory("PolyYieldVault");
  const vault = await PolyYieldVault.deploy(
    await usdc.getAddress(),
    deployer.address, // AI oracle = deployer for now
    "PolyYield USDC Vault",
    "pyUSDC"
  );
  await vault.waitForDeployment();
  console.log("PolyYieldVault:", await vault.getAddress());

  // 3. Deploy 3 Mock Strategies (simulating different Polkadot parachains)
  const MockStrategy = await hre.ethers.getContractFactory("MockStrategy");

  console.log("\n⚡ Deploying Mock Strategies...");

  const strategies = [
    { name: "Bifrost vDOT Pool", protocol: "Bifrost Finance", apy: 850 },   // 8.5%
    { name: "Acala aUSD Lending", protocol: "Acala Network", apy: 1200 },   // 12%
    { name: "HydraDX Omnipool", protocol: "HydraDX", apy: 650 },            // 6.5%
  ];

  const deployedStrategies = [];
  for (const s of strategies) {
    const strategy = await MockStrategy.deploy(
      await usdc.getAddress(),
      s.name,
      s.protocol,
      s.apy
    );
    await strategy.waitForDeployment();
    const addr = await strategy.getAddress();
    console.log(`  ✅ ${s.name} (${s.apy / 100}% APY): ${addr}`);
    deployedStrategies.push({ ...s, address: addr, contract: strategy });
  }

  // 4. Wire strategies to vault
  console.log("\n🔗 Registering strategies in vault...");
  for (const s of deployedStrategies) {
    await vault.addStrategy(s.address);
    await s.contract.setVault(await vault.getAddress());
    console.log(`  ✅ Registered: ${s.name}`);
  }

  // 5. Mint some USDC to deployer for testing
  console.log("\n💰 Minting test USDC...");
  await usdc.faucet(10_000n * 1_000_000n); // 10,000 USDC
  console.log("  ✅ Minted 10,000 USDC to deployer");

  // 6. Summary
  console.log("\n" + "=".repeat(60));
  console.log("🚀 DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log("MockUSDC:       ", await usdc.getAddress());
  console.log("PolyYieldVault: ", await vault.getAddress());
  for (const s of deployedStrategies) {
    console.log(`Strategy [${s.name}]: ${s.address}`);
  }
  console.log("\nActive strategy: Bifrost vDOT Pool (8.5% APY)");
  console.log("AI Oracle address:", deployer.address);

  // Save addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      MockUSDC: await usdc.getAddress(),
      PolyYieldVault: await vault.getAddress(),
    },
    strategies: deployedStrategies.map(s => ({
      name: s.name,
      protocol: s.protocol,
      apy: s.apy,
      address: s.address,
    })),
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n📄 Saved to deployments/${hre.network.name}.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

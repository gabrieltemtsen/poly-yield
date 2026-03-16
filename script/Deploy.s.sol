// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MockStrategy.sol";
import "../src/PolyYieldVault.sol";

contract DeployPolyYield is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        // 1. Deploy MockUSDC
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC:       ", address(usdc));

        // 2. Deploy vault (deployer is AI oracle initially)
        PolyYieldVault vault = new PolyYieldVault(
            address(usdc),
            deployer,
            "PolyYield USDC Vault",
            "pyUSDC"
        );
        console.log("PolyYieldVault: ", address(vault));

        // 3. Deploy 3 mock strategies
        MockStrategy bifrost = new MockStrategy(
            address(usdc), "Bifrost vDOT Pool", "Bifrost Finance", 850
        );
        MockStrategy acala = new MockStrategy(
            address(usdc), "Acala aUSD Lending", "Acala Network", 1200
        );
        MockStrategy hydra = new MockStrategy(
            address(usdc), "HydraDX Omnipool", "HydraDX", 650
        );

        console.log("Bifrost Strategy:", address(bifrost));
        console.log("Acala Strategy:  ", address(acala));
        console.log("HydraDX Strategy:", address(hydra));

        // 4. Wire strategies
        vault.addStrategy(address(bifrost));
        vault.addStrategy(address(acala));
        vault.addStrategy(address(hydra));

        bifrost.setVault(address(vault));
        acala.setVault(address(vault));
        hydra.setVault(address(vault));

        // 5. Mint test USDC to deployer
        usdc.faucet(10_000 * 1e6);
        console.log("Minted 10,000 USDC to deployer");

        vm.stopBroadcast();

        // Write deployment to JSON
        string memory json = string(abi.encodePacked(
            '{"MockUSDC":"', vm.toString(address(usdc)),
            '","PolyYieldVault":"', vm.toString(address(vault)),
            '","BifrostStrategy":"', vm.toString(address(bifrost)),
            '","AcalaStrategy":"', vm.toString(address(acala)),
            '","HydraDXStrategy":"', vm.toString(address(hydra)),
            '","deployer":"', vm.toString(deployer), '"}'
        ));
        vm.writeFile("deployments/latest.json", json);
        console.log("Saved to deployments/latest.json");
    }
}

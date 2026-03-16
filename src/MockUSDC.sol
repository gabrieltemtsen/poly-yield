// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC
/// @notice Faucet USDC for testnet demos
contract MockUSDC is ERC20, Ownable {
    uint8 private constant _decimals = 6;

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return _decimals;
    }

    /// @notice Anyone can mint up to 10,000 USDC for testing
    function faucet(uint256 amount) external {
        require(amount <= 10_000 * 1e6, "MockUSDC: max 10k per call");
        _mint(msg.sender, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

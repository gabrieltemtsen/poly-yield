// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IYieldStrategy
/// @notice Interface for all yield strategies plugged into PolyYield
interface IYieldStrategy {
    /// @notice Deposit tokens into the strategy
    function deposit(uint256 amount) external;

    /// @notice Withdraw tokens from the strategy
    function withdraw(uint256 amount) external;

    /// @notice Returns total assets under management in this strategy
    function totalAssets() external view returns (uint256);

    /// @notice Returns current annualized yield in basis points (e.g. 500 = 5%)
    function currentAPY() external view returns (uint256);

    /// @notice Human-readable strategy name
    function name() external view returns (string memory);

    /// @notice The parachain/protocol this strategy is on
    function protocol() external view returns (string memory);
}

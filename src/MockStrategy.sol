// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IYieldStrategy.sol";

/// @title MockStrategy
/// @notice Simulates a yield strategy for testnet demo purposes.
///         Accumulates mock yield at a configurable rate.
contract MockStrategy is IYieldStrategy, Ownable {
    IERC20 public immutable asset;
    string private _name;
    string private _protocol;

    uint256 private _totalAssets;
    uint256 private _apy; // in basis points
    uint256 private _lastYieldTime;
    address public vault;

    event Deposited(uint256 amount, uint256 totalAssets);
    event Withdrawn(uint256 amount, uint256 totalAssets);
    event YieldAccrued(uint256 amount);

    modifier onlyVault() {
        require(msg.sender == vault, "MockStrategy: only vault");
        _;
    }

    constructor(
        address _asset,
        string memory strategyName,
        string memory protocolName,
        uint256 initialAPY
    ) Ownable(msg.sender) {
        asset = IERC20(_asset);
        _name = strategyName;
        _protocol = protocolName;
        _apy = initialAPY;
        _lastYieldTime = block.timestamp;
    }

    function setVault(address _vault) external onlyOwner {
        vault = _vault;
    }

    function setAPY(uint256 newAPY) external onlyOwner {
        _accrueYield();
        _apy = newAPY;
    }

    function deposit(uint256 amount) external override onlyVault {
        _accrueYield();
        asset.transferFrom(msg.sender, address(this), amount);
        _totalAssets += amount;
        emit Deposited(amount, _totalAssets);
    }

    function withdraw(uint256 amount) external override onlyVault {
        _accrueYield();
        require(_totalAssets >= amount, "MockStrategy: insufficient assets");
        _totalAssets -= amount;
        asset.transfer(msg.sender, amount);
        emit Withdrawn(amount, _totalAssets);
    }

    function totalAssets() external view override returns (uint256) {
        // Include pending yield in view
        uint256 elapsed = block.timestamp - _lastYieldTime;
        uint256 pendingYield = (_totalAssets * _apy * elapsed) / (10000 * 365 days);
        return _totalAssets + pendingYield;
    }

    function currentAPY() external view override returns (uint256) {
        return _apy;
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function protocol() external view override returns (string memory) {
        return _protocol;
    }

    function _accrueYield() internal {
        uint256 elapsed = block.timestamp - _lastYieldTime;
        if (elapsed > 0 && _totalAssets > 0) {
            uint256 yieldAmount = (_totalAssets * _apy * elapsed) / (10000 * 365 days);
            if (yieldAmount > 0) {
                _totalAssets += yieldAmount;
                emit YieldAccrued(yieldAmount);
            }
        }
        _lastYieldTime = block.timestamp;
    }
}

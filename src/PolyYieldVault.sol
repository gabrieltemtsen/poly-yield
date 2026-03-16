// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IYieldStrategy.sol";

/// @title PolyYieldVault
/// @notice AI-powered cross-parachain yield aggregator on Polkadot Hub.
///         Users deposit stablecoins; the AI oracle picks the best yield
///         strategy across Polkadot parachains and rebalances automatically.
contract PolyYieldVault is ERC20, Ownable, ReentrancyGuard {
    // ─── State ───────────────────────────────────────────────────────────────

    IERC20 public immutable asset;         // Underlying stablecoin (e.g. USDC)
    address public aiOracle;               // Off-chain AI oracle address

    IYieldStrategy[] public strategies;    // All registered strategies
    uint256 public activeStrategyIndex;    // Currently active strategy
    uint256 public totalDeposited;         // Total user deposits (excl. yield)

    uint256 public constant MAX_STRATEGIES = 10;
    uint256 public constant REBALANCE_COOLDOWN = 1 hours;
    uint256 public lastRebalanceTime;

    // ─── Events ──────────────────────────────────────────────────────────────

    event Deposited(address indexed user, uint256 assets, uint256 shares);
    event Withdrawn(address indexed user, uint256 assets, uint256 shares);
    event StrategyAdded(address strategy, string name, string protocol);
    event Rebalanced(uint256 fromIndex, uint256 toIndex, string reason);
    event OracleUpdated(address newOracle);

    // ─── Modifiers ───────────────────────────────────────────────────────────

    modifier onlyOracle() {
        require(msg.sender == aiOracle || msg.sender == owner(), "PolyYield: not oracle");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(
        address _asset,
        address _aiOracle,
        string memory vaultName,
        string memory vaultSymbol
    ) ERC20(vaultName, vaultSymbol) Ownable(msg.sender) {
        asset = IERC20(_asset);
        aiOracle = _aiOracle;
    }

    // ─── User Actions ────────────────────────────────────────────────────────

    /// @notice Deposit stablecoins and receive vault shares
    function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
        require(assets > 0, "PolyYield: zero deposit");
        require(strategies.length > 0, "PolyYield: no strategies");

        shares = _convertToShares(assets);
        require(shares > 0, "PolyYield: zero shares");

        asset.transferFrom(msg.sender, address(this), assets);
        totalDeposited += assets;

        // Forward to active strategy
        asset.approve(address(strategies[activeStrategyIndex]), assets);
        strategies[activeStrategyIndex].deposit(assets);

        _mint(msg.sender, shares);
        emit Deposited(msg.sender, assets, shares);
    }

    /// @notice Burn shares and withdraw stablecoins + yield
    function withdraw(uint256 shares) external nonReentrant returns (uint256 assets) {
        require(shares > 0, "PolyYield: zero shares");
        require(balanceOf(msg.sender) >= shares, "PolyYield: insufficient shares");

        assets = _convertToAssets(shares);
        require(assets > 0, "PolyYield: zero assets");

        _burn(msg.sender, shares);
        strategies[activeStrategyIndex].withdraw(assets);
        asset.transfer(msg.sender, assets);

        emit Withdrawn(msg.sender, assets, shares);
    }

    // ─── Oracle / Rebalance ──────────────────────────────────────────────────

    /// @notice AI oracle calls this to switch to a better strategy.
    ///         `reason` is a human-readable explanation from the AI.
    function rebalance(uint256 newStrategyIndex, string calldata reason) external onlyOracle {
        require(newStrategyIndex < strategies.length, "PolyYield: invalid strategy");
        require(
            block.timestamp >= lastRebalanceTime + REBALANCE_COOLDOWN,
            "PolyYield: cooldown active"
        );

        uint256 oldIndex = activeStrategyIndex;
        if (oldIndex == newStrategyIndex) return;

        // Pull all funds from current strategy
        IYieldStrategy current = strategies[oldIndex];
        uint256 currentAssets = current.totalAssets();
        if (currentAssets > 0) {
            current.withdraw(currentAssets);
        }

        // Push to new strategy
        activeStrategyIndex = newStrategyIndex;
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.approve(address(strategies[newStrategyIndex]), balance);
            strategies[newStrategyIndex].deposit(balance);
        }

        lastRebalanceTime = block.timestamp;
        emit Rebalanced(oldIndex, newStrategyIndex, reason);
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    function addStrategy(address strategy) external onlyOwner {
        require(strategies.length < MAX_STRATEGIES, "PolyYield: max strategies");
        IYieldStrategy s = IYieldStrategy(strategy);
        strategies.push(s);
        emit StrategyAdded(strategy, s.name(), s.protocol());
    }

    function setOracle(address newOracle) external onlyOwner {
        aiOracle = newOracle;
        emit OracleUpdated(newOracle);
    }

    // ─── Views ───────────────────────────────────────────────────────────────

    function totalAssets() public view returns (uint256) {
        if (strategies.length == 0) return 0;
        return strategies[activeStrategyIndex].totalAssets();
    }

    function activeStrategy() external view returns (
        string memory stratName,
        string memory protocol,
        uint256 apy,
        uint256 assets
    ) {
        if (strategies.length == 0) return ("", "", 0, 0);
        IYieldStrategy s = strategies[activeStrategyIndex];
        return (s.name(), s.protocol(), s.currentAPY(), s.totalAssets());
    }

    function allStrategies() external view returns (
        string[] memory names,
        string[] memory protocols,
        uint256[] memory apys,
        uint256[] memory assets
    ) {
        uint256 len = strategies.length;
        names = new string[](len);
        protocols = new string[](len);
        apys = new uint256[](len);
        assets = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            names[i] = strategies[i].name();
            protocols[i] = strategies[i].protocol();
            apys[i] = strategies[i].currentAPY();
            assets[i] = strategies[i].totalAssets();
        }
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return _convertToShares(assets);
    }

    function previewWithdraw(uint256 shares) external view returns (uint256) {
        return _convertToAssets(shares);
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _convertToShares(uint256 assets) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return assets;
        uint256 ta = totalAssets();
        if (ta == 0) return assets;
        return (assets * supply) / ta;
    }

    function _convertToAssets(uint256 shares) internal view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }
}

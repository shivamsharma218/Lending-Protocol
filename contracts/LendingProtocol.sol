// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Interfacelending.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract LendingProtocol is ReentrancyGuard {
    IERC20 public collateralToken;
    IERC20 public borrowToken;

    AggregatorV3Interface public collateralPriceFeed;
    AggregatorV3Interface public borrowPriceFeed;

    uint256 public constant LIQUIDATION_BONUS = 10;
    uint256 public constant LTV = 50;
    uint256 public borrowRate = 5;
    uint256 public constant FLASH_LOAN_FEE_BPS = 10;

    mapping(address => uint256) public lastBorrowTime;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;

    constructor(
        address _collateralToken,
        address _borrowToken,
        address _collateralPriceFeed,
        address _borrowPriceFeed
    ) {
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
        collateralPriceFeed = AggregatorV3Interface(_collateralPriceFeed);
        borrowPriceFeed = AggregatorV3Interface(_borrowPriceFeed);
    }

    function _getPrice(AggregatorV3Interface feed) internal view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = feed.latestRoundData();

        require(price > 0, "Invalid price");
        require(updatedAt >= block.timestamp - 3600, "Stale price");
        require(answeredInRound >= roundId, "Incomplete round");

        uint8 decimals = feed.decimals();

        if (decimals < 18) {
            return uint256(price) * (10 ** (18 - decimals));
        } else if (decimals > 18) {
            return uint256(price) / (10 ** (decimals - 18));
        }
        return uint256(price);
    }

    function getCollateralValueUSD(address user) public view returns (uint256) {
        uint256 price = _getPrice(collateralPriceFeed);
        return (collateral[user] * price) / 1e18;
    }

    function getDebtValueUSD(address user) public view returns (uint256) {
        uint256 price = _getPrice(borrowPriceFeed);
        return (debt[user] * price) / 1e18;
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        collateral[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount is zero");

        uint256 collateralUSD = getCollateralValueUSD(msg.sender);
        uint256 maxBorrowUSD = (collateralUSD * LTV) / 100;

        uint256 borrowPrice = _getPrice(borrowPriceFeed);
        uint256 newDebtUSD = getDebtValueUSD(msg.sender) + (amount * borrowPrice) / 1e18;

        require(newDebtUSD <= maxBorrowUSD, "Borrow limit exceeded");

        debt[msg.sender] += amount;

        require(
            borrowToken.balanceOf(address(this)) >= amount,
            "Insufficient liquidity"
        );
        borrowToken.transfer(msg.sender, amount);

        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        require(amount > 0, "Amount is zero");
        require(debt[msg.sender] >= amount, "Repay exceeds debt");
        borrowToken.transferFrom(msg.sender, address(this), amount);
        debt[msg.sender] -= amount;
        emit Repaid(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(collateral[msg.sender] >= amount, "Collateral not enough");

        uint256 collateralPrice = _getPrice(collateralPriceFeed);
        uint256 remainingCollateralUSD = ((collateral[msg.sender] - amount) * collateralPrice) / 1e18;
        uint256 maxBorrowAfterUSD = (remainingCollateralUSD * LTV) / 100;

        require(getDebtValueUSD(msg.sender) <= maxBorrowAfterUSD, "Would become undercollateralized");

        collateral[msg.sender] -= amount;
        collateralToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function isLiquidatable(address user) public view returns (bool) {
        uint256 maxBorrowUSD = (getCollateralValueUSD(user) * LTV) / 100;
        return getDebtValueUSD(user) > maxBorrowUSD;
    }

    function liquidate(address user, uint256 repayAmount) external {
        require(isLiquidatable(user), "Position healthy");
        require(repayAmount <= debt[user], "Too much");

        borrowToken.transferFrom(msg.sender, address(this), repayAmount);
        debt[user] -= repayAmount;

        uint256 borrowPrice = _getPrice(borrowPriceFeed);
        uint256 collateralPrice = _getPrice(collateralPriceFeed);

        uint256 repayValueUSD = (repayAmount * borrowPrice) / 1e18;
        uint256 collateralToSeize = (repayValueUSD * (100 + LIQUIDATION_BONUS) * 1e18)
            / (100 * collateralPrice);

        require(collateral[user] >= collateralToSeize, "Not enough collateral");

        collateral[user] -= collateralToSeize;
        collateralToken.transfer(msg.sender, collateralToSeize);

        emit Liquidated(msg.sender, user, repayAmount, collateralToSeize);
    }

    function flashLoan(address receiver, uint256 amount) external nonReentrant {
        require(amount > 0, "Zero amount");

        uint256 balanceBefore = borrowToken.balanceOf(address(this));
        require(balanceBefore >= amount, "Insufficient liquidity");

        uint256 fee = (amount * FLASH_LOAN_FEE_BPS) / 10000;
        borrowToken.transfer(receiver, amount);

        IFlashLoanReceiver(receiver).executeOperation(amount, fee);

        uint256 balanceAfter = borrowToken.balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "Flash loan not repaid");
    }

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Liquidated(
        address indexed liquidator,
        address indexed user,
        uint256 debtRepaid,
        uint256 collateralSeized
    );
}
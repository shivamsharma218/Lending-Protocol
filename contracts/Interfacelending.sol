// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFlashLoanReceiver {
    function executeOperation(
        uint256 amount,
        uint256 fee
    ) external;
}
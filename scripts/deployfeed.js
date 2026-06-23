// scripts/deployfeed.js
import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
    
    // $1.00 = 100000000 (8 decimals)
    const usdtFeed = await MockPriceFeed.deploy(100000000n);
    const daiFeed = await MockPriceFeed.deploy(100000000n);

    console.log("USDT Feed:", await usdtFeed.getAddress());
    console.log("DAI Feed:", await daiFeed.getAddress());
}

main().catch(console.error);
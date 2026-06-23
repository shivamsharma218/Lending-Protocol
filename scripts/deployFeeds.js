import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const Feed = await ethers.getContractFactory("MockV3Aggregator");

    const usdtFeed = await Feed.deploy(8, 100000000); // $1
    await usdtFeed.waitForDeployment();

    const daiFeed = await Feed.deploy(8, 100000000); // $1
    await daiFeed.waitForDeployment();

    console.log("USDT Feed:", await usdtFeed.getAddress());
    console.log("DAI Feed:", await daiFeed.getAddress());
}

main().catch(console.error);
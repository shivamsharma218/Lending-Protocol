import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const USDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await USDT.deploy();

    await usdt.waitForDeployment();

    console.log("MockUSDT:", await usdt.getAddress());

    const DAI = await ethers.getContractFactory("MockDAI");
    const dai = await DAI.deploy();

    await dai.waitForDeployment();

    console.log("MockDAI:", await dai.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
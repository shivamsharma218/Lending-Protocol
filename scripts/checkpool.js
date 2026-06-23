// scripts/checkpool.js
import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const dai = await ethers.getContractAt(
        "MockDAI",
        "0x702a29C36ED6F8f1B02B5d7f8BE65C1c6dEd867a"
    );

    const poolBalance = await dai.balanceOf(
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    console.log("Pool DAI balance:", ethers.formatEther(poolBalance));
}

main().catch(console.error);
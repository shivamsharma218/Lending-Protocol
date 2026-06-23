import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const [owner] = await ethers.getSigners();

    const usdt = await ethers.getContractAt(
        "MockUSDT",
        "0xA3f5b8903A4dE5529D73548461Ea5f5207134CfB"
    );

    const dai = await ethers.getContractAt(
        "MockDAI",
        "0x702a29C36ED6F8f1B02B5d7f8BE65C1c6dEd867a"
    );

    // Mint tokens to yourself
    await usdt.mint(owner.address, ethers.parseEther("10000"));
    await dai.mint(owner.address, ethers.parseEther("100000"));

    // Fund lending pool with DAI liquidity
    await dai.transfer(
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8",
        ethers.parseEther("50000")
    );

    console.log("Setup complete");
}

main().catch(console.error);
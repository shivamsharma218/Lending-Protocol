// scripts/fundpool.js
import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();

    const dai = await ethers.getContractAt(
        "MockDAI",
        "0x702a29C36ED6F8f1B02B5d7f8BE65C1c6dEd867a"
    );

    // Check your DAI balance first
    const bal = await dai.balanceOf(owner.address);
    console.log("Your DAI balance:", ethers.formatEther(bal));

    // Mint DAI if needed
    if (bal < ethers.parseEther("50000")) {
        await dai.mint(owner.address, ethers.parseEther("100000"));
        console.log("Minted DAI ✅");
    }

    // Fund pool
    await dai.transfer(
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8",
        ethers.parseEther("50000")
    );
    console.log("Pool funded ✅");
}

main().catch(console.error);
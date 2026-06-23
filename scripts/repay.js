import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();

    const dai = await ethers.getContractAt(
        "MockDAI",
        "0x702a29C36ED6F8f1B02B5d7f8BE65C1c6dEd867a"
    );

    const lending = await ethers.getContractAt(
        "LendingProtocol",
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    const debt = await lending.debt(owner.address);
    console.log("Current debt:", ethers.formatEther(debt), "DAI");

    if (debt === 0n) {
        console.log("No debt to repay!");
        return;
    }

    await dai.approve(await lending.getAddress(), debt);
    console.log("Approved ✅");

    await lending.repay(debt);
    console.log("Repaid", ethers.formatEther(debt), "DAI ✅");

    const remaining = await lending.debt(owner.address);
    console.log("Remaining debt:", ethers.formatEther(remaining), "DAI");
}

main().catch(console.error);

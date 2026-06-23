import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();

    const lending = await ethers.getContractAt(
        "LendingProtocol",
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    const collateralBefore = await lending.collateral(owner.address);
    console.log("Collateral before:", ethers.formatEther(collateralBefore), "USDT");

    // Withdraw 1000 USDT
    await lending.withdrawCollateral(ethers.parseEther("1000"));
    console.log("Withdrawn 1000 USDT ✅");

    const collateralAfter = await lending.collateral(owner.address);
    console.log("Collateral after:", ethers.formatEther(collateralAfter), "USDT");
}

main().catch(console.error);
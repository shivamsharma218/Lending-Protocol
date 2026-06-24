import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();

    const usdt = await ethers.getContractAt(
        "MockUSDT",
        "0xA3f5b8903A4dE5529D73548461Ea5f5207134CfB"
    );

    const lending = await ethers.getContractAt(
        "LendingProtocol",
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    // ✅ Approve first
    await usdt.approve(
        await lending.getAddress(),
        ethers.parseEther("1000")
    );
    console.log("Approved ✅");

    // ✅ Then deposit
    await lending.depositCollateral(ethers.parseEther("1000"));
    console.log("Deposited 1000 USDT ✅");

    const collateral = await lending.collateral(owner.address);
    console.log("Collateral:", ethers.formatEther(collateral), "USDT");
}

main().catch(console.error);
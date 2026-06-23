import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const lending = await ethers.getContractAt(
        "LendingProtocol",
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    await lending.borrow(
        ethers.parseEther("500")
    );

    console.log("Borrowed 500 DAI");
}

main().catch(console.error);
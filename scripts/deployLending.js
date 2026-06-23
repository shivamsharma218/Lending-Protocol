import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();

    const Lending = await ethers.getContractFactory("LendingProtocol");

    const lending = await Lending.deploy(
        "0xA3f5b8903A4dE5529D73548461Ea5f5207134CfB",
        "0x702a29C36ED6F8f1B02B5d7f8BE65C1c6dEd867a",
        "0x4b77F6401Ad032633e995EA2213E3f79CD07E18c",
        "0xA30f3B46671b9c9F40161788f1438bB2bCa0d048"
    );

    await lending.waitForDeployment();

    console.log("LendingProtocol:", await lending.getAddress());
}

main().catch(console.error);
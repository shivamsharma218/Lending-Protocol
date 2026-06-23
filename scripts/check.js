import { network } from "hardhat";

async function main() {
    const { ethers } = await network.connect();
    const [owner] = await ethers.getSigners();
    
    const lending = await ethers.getContractAt(
        "LendingProtocol",
        "0xDe3ba8Da809ec0360Fa042467F6C0BD0927519E8"
    );

    const collateral = await lending.collateral(owner.address);
    const debt = await lending.debt(owner.address);
    const collateralUSD = await lending.getCollateralValueUSD(owner.address);
    const debtUSD = await lending.getDebtValueUSD(owner.address);

    console.log("Collateral:", ethers.formatEther(collateral), "USDT");
    console.log("Debt:", ethers.formatEther(debt), "DAI");
    console.log("Collateral USD:", ethers.formatEther(collateralUSD));
    console.log("Debt USD:", ethers.formatEther(debtUSD));
    console.log("Max Borrow USD:", ethers.formatEther(collateralUSD * 50n / 100n));
}

main().catch(console.error);
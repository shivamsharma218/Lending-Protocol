import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log(
    "Block:",
    await ethers.provider.getBlockNumber()
  );
}

main().catch(console.error);
import hre from "hardhat";

async function main() {
  const Lending = await hre.ethers.getContractFactory("LendingProtocol");

  const lending = await Lending.deploy(
    "COLLATERAL_TOKEN",
    "BORROW_TOKEN",
    "COLLATERAL_PRICE_FEED",
    "BORROW_PRICE_FEED"
  );

  await lending.waitForDeployment();

  console.log("Deployed:", await lending.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
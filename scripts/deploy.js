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








/*npx hardhat compile

npx hardhat run scripts/deployTokens.js --network baseSepolia

npx hardhat run scripts/deployFeeds.js --network baseSepolia

npx hardhat run scripts/deployLending.js --network baseSepolia

npx hardhat run scripts/fundpool.js --network baseSepolia

npx hardhat run scripts/deposit.js --network baseSepolia

npx hardhat run scripts/borrow.js --network baseSepolia

npx hardhat run scripts/check.js --network baseSepolia

npx hardhat run scripts/repay.js --network baseSepolia

npx hardhat run scripts/withdraw.js --network baseSepolia

npx hardhat run scripts/checkpool.js --network baseSepolia

npx hardhat run scripts/liquidate.js --network baseSepolia  
*/
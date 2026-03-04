import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying s accountom:", deployer.address);

  const SplitPay = await hre.ethers.getContractFactory("SplitPayWallet");
  const contract = await SplitPay.deploy("Zajednicki fond", 2);

  await contract.waitForDeployment();
  console.log("SplitPayWallet deployан na:", await contract.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

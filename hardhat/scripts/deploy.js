const hre = require("hardhat");
const fs = require("fs");
const path = require("path");


async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying s računom:", deployer.address);

  const SplitPay = await hre.ethers.getContractFactory("SplitPayWallet");
  const contract = await SplitPay.deploy("Zajednicki fond", 2);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("SplitPayWallet deploy na: ", address);

  const outputPath = path.resolve("../frontend/public/contractAddress.json");
  fs.writeFileSync(outputPath, JSON.stringify({ address }, null, 2));
  console.log("Adresa spremljena u:", outputPath);

  
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

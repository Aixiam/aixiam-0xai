import { ethers } from "hardhat";
import { resolve as pathResolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

// Load .env file from the project root
dotenv.config({ path: pathResolve(__dirname, '../../.env') });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // --- Deploy MyProjectContract ---
  const initialMessage = "Hello from VersoriumX!";
  // In a real scenario, this would be a CID from data/metadata.json or a specific asset.
  const initialIpfsCid = "QmPlaceholderCidForInitialData";

  const MyProjectContract = await ethers.getContractFactory("MyProjectContract");
  const myProjectContract = await MyProjectContract.deploy(initialMessage, initialIpfsCid);
  await myProjectContract.waitForDeployment();
  const myProjectContractAddress = await myProjectContract.getAddress();
  console.log("MyProjectContract deployed to:", myProjectContractAddress);

  // --- Resolve versoriumx.eth address for 0xAI Token initial recipient ---
  const versoriumxEnsName = "versoriumx.eth";
  // Attempt to resolve ENS name; if running on local Hardhat, this might not resolve
  // so we'll fall back to the deployer's address or a predefined address for local dev.
  let initialTokenRecipientAddress: string | null = null;
  const network = await ethers.provider.getNetwork();

  // ENS resolution is usually not available on a local Hardhat network by default.
  // We'll try to resolve, but fallback if it's the local network.
  if (network.chainId === 31337) { // Hardhat/localhost network
    console.warn(`ENS resolution for '${versoriumxEnsName}' might not be available on localhost. Falling back to deployer address for initial token recipient.`);
    initialTokenRecipientAddress = deployer.address;
  } else {
    try {
      const resolvedAddress = await ethers.provider.resolveName(versoriumxEnsName);
      if (!resolvedAddress) {
        throw new Error(`ENS name '${versoriumxEnsName}' could not be resolved.`);
      }
      initialTokenRecipientAddress = resolvedAddress;
      console.log(`Resolved ${versoriumxEnsName} to address: ${initialTokenRecipientAddress}`);
    } catch (error) {
      console.error(`Error resolving ENS name '${versoriumxEnsName}':`, error.message);
      console.warn(`Falling back to deployer address for initial token recipient due to ENS resolution failure.`);
      initialTokenRecipientAddress = deployer.address;
    }
  }

  if (!initialTokenRecipientAddress) {
    throw new Error(`Failed to determine an initial recipient address for 0xAI Token.`);
  }

  // --- Deploy 0xAI Token Contract ---
  const OxAIToken = await ethers.getContractFactory("OxAIToken");
  // The constructor is payable, but we're sending 0 ETH here.
  // You can change `ethers.parseEther("0.0")` to a value like `ethers.parseEther("0.1")`
  // if the token contract itself needs initial ETH.
  const oxAITokenContract = await OxAIToken.deploy(initialTokenRecipientAddress, { value: ethers.parseEther("0.0") });
  await oxAITokenContract.waitForDeployment();
  const oxAITokenContractAddress = await oxAITokenContract.getAddress();
  console.log("0xAI Token Contract deployed to:", oxAITokenContractAddress);
  console.log(`Initial 1,000,000,000 0xAI tokens minted to: ${initialTokenRecipientAddress}`);

  // --- Deploy CompanyToken Contract ---
  // Assuming MyProjectContract.vy is now CompanyToken.vy, we'll use that as the "company" address.
  // Otherwise, you'd specify deployer.address or another address here.
  const companyAddressForToken = myProjectContractAddress; // The MyProjectContract instance will act as the "company"
  const totalSharesForCompany = ethers.parseUnits("1000000", 0); // 1,000,000 shares, 0 decimals for shares
  const initialPriceWeiPerShare = ethers.parseEther("0.001"); // 0.001 ETH per share

  const CompanyToken = await ethers.getContractFactory("CompanyToken");
  const companyTokenContract = await CompanyToken.deploy(
    companyAddressForToken,
    totalSharesForCompany,
    initialPriceWeiPerShare
  );
  await companyTokenContract.waitForDeployment();
  const companyTokenContractAddress = await companyTokenContract.getAddress();
  console.log("CompanyToken deployed to:", companyTokenContractAddress);
  console.log(`CompanyToken initialized with company address: ${companyAddressForToken}`);

  // --- Save Deployment Information ---
  // The network variable is already defined above
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  const deploymentsDir = pathResolve(__dirname, '../artifacts/deployments');

  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    MyProjectContract: myProjectContractAddress,
    OxAIToken: oxAITokenContractAddress,
    CompanyToken: companyTokenContractAddress, // Added CompanyToken
    Deployer: deployer.address,
    Network: networkName,
    Timestamp: new Date().toISOString(),
  };

  const deploymentFilePath = pathResolve(deploymentsDir, `${networkName}.json`);
  writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${deploymentFilePath}`);

  // For production, a separate script would typically handle updating frontend/dapp config
  // with these addresses and CIDs.
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

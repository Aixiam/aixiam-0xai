import { ethers } from "hardhat";
import { resolve as pathResolve } from 'path';
import dotenv from 'dotenv';

// Load .env file from the project root
dotenv.config({ path: pathResolve(__dirname, '../../.env') });

async function main() {
  const [sender] = await ethers.getSigners();
  console.log("Funding from account:", sender.address);

  const versoriumxEnsName = "versoriumx.eth";
  let amountEth = "0.01"; // Default amount to send

  // Parse command line arguments if any
  const args = process.argv.slice(2);
  const amountIndex = args.indexOf('--amount');
  if (amountIndex !== -1 && args[amountIndex + 1]) {
    amountEth = args[amountIndex + 1];
  }

  console.log(`Attempting to fund ${versoriumxEnsName} with ${amountEth} ETH.`);

  try {
    const versoriumxAddress = await ethers.provider.resolveName(versoriumxEnsName);

    if (!versoriumxAddress) {
      throw new Error(`Could not resolve ENS name: ${versoriumxEnsName}`);
    }

    console.log(`Resolved ${versoriumxEnsName} to address: ${versoriumxAddress}`);

    const tx = await sender.sendTransaction({
      to: versoriumxAddress,
      value: ethers.parseEther(amountEth),
    });

    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaction confirmed. ${amountEth} ETH sent to ${versoriumxAddress}.`);

    const balance = await ethers.provider.getBalance(versoriumxAddress);
    console.log(`${versoriumxEnsName} balance after funding: ${ethers.formatEther(balance)} ETH`);

  } catch (error) {
    console.error("Funding failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

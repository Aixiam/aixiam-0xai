import { run, task } from "hardhat";
import { resolve as pathResolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

// This script aims to provide a programmatic way to compile Vyper.
// Hardhat's `compile` task handles this, but this script demonstrates how you
// might expose a programmatic API or customize compilation.

task("vyper-compile-specific", "Compiles a specific Vyper contract file")
  .addParam("contract", "The path to the Vyper contract file relative to contracts/")
  .setAction(async (taskArgs, hre) => {
    const contractPath = `contracts/${taskArgs.contract}`;
    console.log(`Attempting to compile Vyper contract: ${contractPath}`);

    if (!existsSync(contractPath)) {
      console.error(`Error: Contract file not found at ${contractPath}`);
      return;
    }

    try {
      // Hardhat's compile task handles Vyper compilation via hardhat-vyper plugin
      await hre.run("compile");
      console.log(`Compilation successful for ${contractPath}`);

      // You can then extract artifacts programmatically
      const artifactsPath = pathResolve(hre.config.paths.artifacts, contractPath.replace(".vy", ".json"));
      if (existsSync(artifactsPath)) {
        const artifact = JSON.parse(readFileSync(artifactsPath, 'utf-8'));
        console.log(`ABI for ${taskArgs.contract}:`, artifact.abi);
        console.log(`Bytecode for ${taskArgs.contract}:`, artifact.bytecode);

        // Example: Save ABI to a more accessible folder for frontend
        const outputDir = pathResolve(__dirname, '../../build/contracts');
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true });
        }
        const abiOutputPath = pathResolve(outputDir, `${taskArgs.contract.replace(".vy", "")}.abi.json`);
        writeFileSync(abiOutputPath, JSON.stringify(artifact.abi, null, 2));
        console.log(`ABI saved to: ${abiOutputPath}`);

      } else {
        console.warn(`Artifact not found for ${contractPath}. Ensure compilation generated it.`);
      }

    } catch (error) {
      console.error(`Failed to compile ${contractPath}:`, error);
    }
  });

// If this script is run directly, it will default to running the main compile task
async function main() {
  console.log("Running Hardhat's main compile task...");
  await run("compile");
  console.log("All contracts compiled.");
}

// You can comment out main() if you only intend to use the task via `hardhat run`
// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });

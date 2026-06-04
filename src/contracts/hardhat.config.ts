import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper";
import dotenv from 'dotenv';
import { resolve as pathResolve } from 'path';

// Load .env file from the project root
dotenv.config({ path: pathResolve(__dirname, '../../.env') });

const config: HardhatUserConfig = {
  solidity: { // Even with Vyper, Solidity config might be needed for plugins or if you add Solidity contracts later
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  vyper: { // Vyper compiler configuration
    version: "0.3.10", // Ensure this matches your contract's @version pragma
  },
  networks: {
    hardhat: {
      chainId: 31337, // Default Hardhat Network ID
      allowUnlimitedContractSize: true, // Useful for large Vyper contracts during dev
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  etherscan: { // For contract verification on Etherscan
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "", // You'll need an Etherscan API key
      mainnet: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  paths: {
    sources: "./contracts", // Where Hardhat finds your .vy and .sol files
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: { // For generating TypeScript types from contract ABIs
    outDir: "typechain-types",
    target: "ethers-v6", // Use ethers v6 for compatibility with latest Hardhat toolbox
  },
  gasReporter: { // Optional: for gas usage reporting
    enabled: (process.env.REPORT_GAS === 'true') || false,
    currency: "USD",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasprice",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  }
};

export default config;

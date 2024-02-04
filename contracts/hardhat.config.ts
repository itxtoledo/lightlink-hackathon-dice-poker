import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    // for mainnet
    "lightlink-mainnet": {
      url: "https://replicator.phoenix.lightlink.io/rpc/v1",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    // for testnet
    "lightlink-testnet": {
      url: "https://replicator.pegasus.lightlink.io/rpc/v1",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    // for local dev environment
    "base-local": {
      url: "http://localhost:8545",
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
  },
  defaultNetwork: "hardhat",
};

export default config;

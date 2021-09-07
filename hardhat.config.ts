import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";

import dotenv from 'dotenv';

import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    polygon: {
      url: "https://rpc-mainnet.matic.network",
      accounts: {
        // 0x7b9E9Ca0796AF98444E0196b7F90513ec6116d5E
        mnemonic: process.env.MNEMONIC,
      },
    },
    localhost: {
      url: "http://localhost:8545",
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_KEY
  }
};

export default config;
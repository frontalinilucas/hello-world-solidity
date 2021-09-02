const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = '[YOUR_MNEMONIC]';

module.exports = {
  networks: {
    development: {      
      host: 'localhost',
      port: 7545,
      network_id: '*',
      gas: 5000000
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, "https://goerli.infura.io/v3/[YOUR_PROJECT_ID]"),
      network_id: 5,
      networkCheckTimeout: 100000000000,
      timeoutBlocks: 500,
    }
  }
}
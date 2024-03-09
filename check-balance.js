// Libraries
const { AccountManager } = require("@iota/wallet");
const { utf8ToHex, MintNftParams, Wallet } = require("@iota/sdk");

// Environment variables
require("dotenv").config();
const password = process.env.SH_PASSWORD;
const accountName = process.env.ACCOUNT_NAME;

// For better readability, some console output will be printed in a different color
const consoleColor = "\x1b[36m%s\x1b[0m";
async function run() {
  try {
    // Create a new account manager from existing database path
    const manager = new Wallet({
      storagePath: `./${accountName}-database`,
    });

    // Pass password to manager
    await manager.setStrongholdPassword("Excuse721");

    // Get specific account from account manager
    const account = await manager.getAccount(accountName); // Always sync before getting the account balance
    await account.sync();
    const balance = await account.getBalance();
    const addresses = await account.addresses();

    console.log(consoleColor, `${accountName}'s Address(es):`);
    console.log(addresses, "\n");

    console.log(consoleColor, `${accountName}'s Total Balance:`);
    console.log(balance, "\n");
  } catch (error) {
    console.log("Error: ", error);
  }
  process.exit(0);
}

run();

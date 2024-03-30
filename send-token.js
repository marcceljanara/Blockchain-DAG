const { AccountManager } = require("@iota/wallet");
const { TextEncoder } = require("util");
const { MintNftParams, Wallet, utf8ToHex } = require("@iota/sdk");
require("dotenv").config();

async function run() {
  const password = process.env.SH_PASSWORD;
  const accountName = process.env.ACCOUNT_NAME;
  try {
    if (!process.env.SH_PASSWORD) {
      throw new Error(".env SH_PASSWORD is undefined, see .env.example");
    }
    if (!process.env.SH_PASSWORD) {
      throw new Error(".env SH_PASSWORD is undefined, see .env.example");
    }

    const wallet = new Wallet({
      storagePath: `./${accountName}-database`,
    });

    const account = await wallet.getAccount(accountName);

    // We send from the first address in the account.
    const senderAddress = (await account.addresses())[0].address;

    await account.sync();

    // We need to unlock stronghold.
    await wallet.setStrongholdPassword(password);

    // Replace with the address of your choice!
    const address =
      "rms1qpszqzadsym6wpppd6z037dvlejmjuke7s24hm95s9fg9vpua7vluaw60xu";
    const amount = BigInt(1);

    const transaction = (await account.getBalance()).nfts[2];
    console.log(transaction);

    // console.log(`Transaction sent: ${transaction.transactionId}`);

    // const blockId = await account.retryTransactionUntilIncluded(
    //   transaction.transactionId
    // );

    // console.log(`Block sent: ${process.env.EXPLORER_URL}/block/${blockId}`);
  } catch (error) {
    console.log("Error: ", error);
  }
  process.exit(0);
}

run();

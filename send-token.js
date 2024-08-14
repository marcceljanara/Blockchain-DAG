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
      "rms1qzf5a8sxn7j9avqm9j444vxncjcnete9nkezlvtva40l2s523y8esnll3z6";
    const amount = BigInt(800000000);

    const transaction = await account.send(amount, address, {
      allowMicroAmount: true,
    });
    console.log(transaction);

    console.log(`Transaction sent: ${transaction.transactionId}`);

    const blockId = await account.retryTransactionUntilIncluded(
      transaction.transactionId
    );

    console.log(`Block sent: ${process.env.EXPLORER_URL}/block/${blockId}`);
  } catch (error) {
    console.log("Error: ", error);
  }
  process.exit(0);
}

run();

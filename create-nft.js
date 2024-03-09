// Libraries
// const { utf8ToHex } = require("@iota/sdk");
const { AccountManager } = require("@iota/wallet");
const { TextEncoder } = require("util");
const { MintNftParams, Wallet, utf8ToHex } = require("@iota/sdk");

// async function uploadByPath(filePath) {
//   try {
//     console.log("\n");
//     console.log(consoleColor, `Start local IPFS node for upload:`);

//     // Set up local IPFS node for upload
//     let node;
//     if (!node) {
//       node = await IPFS.create({
//         repo: `ipfs_node`,
//       });
//     }

//     // Read file from path
//     const file = fs.readFileSync(filePath);

//     // Upload file to IPFS
//     const fileAdded = await node.add(file);
//     const contentIdentifier = fileAdded.path;

//     console.log("\n");
//     console.log(
//       consoleColor,
//       `Your file was uploaded to IPFS with the following Content Identifier (CID):`
//     );
//     console.log(contentIdentifier, "\n");

//     console.log(consoleColor, `Check your file on IPFS:`);
//     console.log(`https://ipfs.io/ipfs/${contentIdentifier}`, "\n");

//     return contentIdentifier;
//   } catch (error) {
//     console.error("IPFS upload error", error);
//   }
// }

// uploadByPath();

async function run() {
  const password = process.env.SH_PASSWORD;
  const accountName = process.env.ACCOUNT_NAME;
  try {
    const ipfsCid =
      "bafybeidy42if7qqrkkkxpyvxyveaf57tqeegojucmmi5m7lbwpdd5lci5q";

    // Define NFT metadata
    const metadataObject = {
      standard: "IRC27",
      type: "image/jpeg",
      version: "v1.0",
      name: "kafka manis",
      uri: `https://bafybeidy42if7qqrkkkxpyvxyveaf57tqeegojucmmi5m7lbwpdd5lci5q.ipfs.w3s.link/`,
    };

    const metadataBytes = utf8ToHex(JSON.stringify(metadataObject));

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

    // We need to unlock stronghold.
    await wallet.setStrongholdPassword(password);
    const params = {
      sender: senderAddress,
      metadata: metadataBytes,
      tag: utf8ToHex("Nyoman Ganteng"),
      issuer: senderAddress,
      immutableMetadata: metadataBytes,
    };
    const prepared = await account.prepareMintNfts([params]);

    let transaction = await prepared.send();
    console.log(`Transaction sent: ${transaction.transactionId}`);

    // Wait for transaction to get included
    let blockId = await account.retryTransactionUntilIncluded(
      transaction.transactionId
    );

    console.log(`Block included: ${process.env.EXPLORER_URL}/block/${blockId}`);
    console.log("Minted NFT!");
  } catch (error) {
    console.log("Error: ", error);
  }
  process.exit(0);
}
run();

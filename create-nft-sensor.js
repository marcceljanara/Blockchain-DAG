const { AccountManager } = require("@iota/wallet");
const { TextEncoder } = require("util");
const { MintNftParams, Wallet, utf8ToHex } = require("@iota/sdk");
const { NFTStorage, File, Blob } = require('nft.storage');
const fs = require('fs');
const path = require('path');
const {AES} = require('crypto-js');
const {nanoid} = require('nanoid');


require("dotenv").config();

async function uploadByPath(filePath) {
  try {
    const nftStorageToken = process.env.NFT_STORAGE_TOKEN;
    const client = new NFTStorage({ token: nftStorageToken });
    const content = await fs.promises.readFile(filePath); // Menggunakan filePath yang diberikan sebagai argumen
    const someData = new Blob([content]);
    const cid = await client.storeBlob(someData);
    console.log("Uploaded file:", filePath, "with CID:", cid);
    return cid;
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error; // Dilemparkan kembali untuk ditangani di fungsi run()
  }
}

async function run() {
  const password = process.env.SH_PASSWORD;
  const accountName = process.env.ACCOUNT_NAME;
  const aesKey = process.env.AES_KEY;
  const folderPath = './dataset-sensor'; // Ubah sesuai dengan path folder Anda

  try {
    // Mendapatkan daftar file dalam folder
    const files = await fs.promises.readdir(folderPath);

    const wallet = new Wallet({
      storagePath: `./${accountName}-database`,
    });

    const account = await wallet.getAccount(accountName);
    const senderAddress = (await account.addresses())[0].address;
    await wallet.setStrongholdPassword(password);

    for (const file of files) {
      // Membuat path lengkap untuk setiap file dalam folder
      const filePath = path.join(folderPath, file);

      // Mengunggah file ke IPFS
      const ipfsCid = await uploadByPath(filePath);

      // enkripsi uri
      const encryptedUri = AES.encrypt(`https://${ipfsCid}.ipfs.nftstorage.link/`, aesKey).toString();

      // Membuat metadata untuk NFT
      const metadataObject = {
        id : nanoid(10),
        standard: "IRC27",
        type: "text/csv",
        version: "v1.0",
        name: file,
        uri: encryptedUri,
      };

      const metadataBytes = utf8ToHex(JSON.stringify(metadataObject));

      // Persiapan mint NFT
      const params = {
        sender: senderAddress,
        metadata: metadataBytes,
        tag: utf8ToHex("TEST NFT LRS"),
        issuer: senderAddress,
        immutableMetadata: metadataBytes,
      };
      const prepared = await account.prepareMintNfts([params]);

      // Mengirim transaksi
      const transaction = await prepared.send();
      console.log(`Transaction sent for file ${file}: ${transaction.transactionId}`);

      // Menunggu transaksi dimasukkan ke dalam blok
      const blockId = await account.retryTransactionUntilIncluded(transaction.transactionId);
      console.log(`Block included for file ${file}: ${process.env.EXPLORER_URL}/block/${blockId}`);
    }

    console.log("All files uploaded and NFTs minted!");
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

run();

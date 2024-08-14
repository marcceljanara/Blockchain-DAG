const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const CID = require('cids');
const { AccountManager } = require('@iota/wallet');
const { utf8ToHex, Wallet, MintNftParams } = require('@iota/sdk');
const { AES } = require('crypto-js');
const { nanoid } = require('nanoid');
require('dotenv').config();

// Inisialisasi IPFS client
const ipfs = create({ url: 'http://93.127.185.37:5001/' });

async function uploadFile(filePath) {
  try {
    // Membaca file dari sistem file
    const file = fs.readFileSync(filePath);

    // Mengunggah file ke IPFS
    const result = await ipfs.add(file);
    const cidBase58 = result.path;

    // Konversi CID dari base58 ke CID versi 1 jika perlu
    const cid = new CID(cidBase58);
    let cidV1;
    if (cid.version === 0) {
      cidV1 = cid.toV1();
    } else {
      cidV1 = cid;
    }

    // Konversi CID versi 1 ke base32
    const cidBase32 = cidV1.toString('base32');
    return cidBase32;
  } catch (error) {
    console.error('Error mengunggah file ke IPFS:', error);
    throw error;
  }
}

async function run() {
  const password = process.env.SH_PASSWORD;
  const accountName = process.env.ACCOUNT_NAME;
  const aesKey = process.env.AES_KEY;
  const folderPath = path.resolve(__dirname, 'dataset-models');

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
      const cidBase32 = await uploadFile(filePath);

      // Enkripsi URI
      const encryptedUri = AES.encrypt(`https://ipfs.xsmartagrichain.com/ipfs/${cidBase32}`, aesKey).toString();

      // Membuat metadata untuk NFT
      const metadataObject = {
        id: nanoid(10),
        standard: "IRC27",
        type: "application/x-hdf5",
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
      fs.unlinkSync(filePath);
    }

    console.log("All files uploaded and NFTs minted!");
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

run();

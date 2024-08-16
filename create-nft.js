const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const CID = require('cids');
const { Wallet, utf8ToHex } = require('@iota/sdk');
const { AES } = require('crypto-js');
const { nanoid } = require('nanoid');
require('dotenv').config();

// Inisialisasi IPFS client
const ipfs = create({ url: 'https://storage.xsmartagrichain.com/' });

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

async function mintNftAndDeleteFile(filePath, file, wallet, account, senderAddress, aesKey) {
  try {
    const cidBase32 = await uploadFile(filePath);

    // Enkripsi URI
    const encryptedUri = AES.encrypt(`https://ipfs.xsmartagrichain.com/ipfs/${cidBase32}`, aesKey).toString();

    // Membuat metadata untuk NFT
    const metadataObject = {
      id: nanoid(10),
      standard: "IRC27",
      type: "image/jpeg",
      version: "v1.0",
      name: `ripe-${file}`,
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

    // Menghapus file dari folder
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error minting NFT for file ${file}:`, error);
    throw error;
  }
}

async function processFile(filePath, file, wallet, account, senderAddress, aesKey) {
  while (true) {
    try {
      await mintNftAndDeleteFile(filePath, file, wallet, account, senderAddress, aesKey);
      console.log(`Successfully processed file: ${file}`);
      break; // Keluar dari loop jika berhasil
    } catch (error) {
      if (error.message && error.message.includes('address owns insufficient funds')) {
        console.error('Insufficient funds. Retrying in 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // Tunggu 30 detik sebelum mencoba lagi
      } else {
        console.error('Error:', error);
        await account.sync();
        // Jika kesalahan bukan masalah dana, coba lagi
      }
    }
  }
}

async function run() {
  const password = process.env.SH_PASSWORD;
  const accountName = process.env.ACCOUNT_NAME;
  const aesKey = process.env.AES_KEY;
  const folderPath = './dataset'; // Ubah sesuai dengan path folder Anda

  const wallet = new Wallet({
    storagePath: `./${accountName}-database`,
  });

  const account = await wallet.getAccount(accountName);
  const senderAddress = (await account.addresses())[0].address;
  await wallet.setStrongholdPassword(password);

  while (true) {
    try {
      // Mendapatkan daftar file dalam folder
      const files = await fs.promises.readdir(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        await processFile(filePath, file, wallet, account, senderAddress, aesKey);
      }

      console.log("All files processed!");
    } catch (error) {
      console.error("Error during file processing:", error);
    }

    // Tunggu sebelum memeriksa folder lagi
    await new Promise(resolve => setTimeout(resolve, 60000)); // Tunggu 1 menit sebelum memeriksa folder lagi
  }
}

run();

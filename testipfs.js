const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
const CID = require('cids');

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

    // Jika CID versi 0, ubah ke CID versi 1
    let cidV1;
    if (cid.version === 0) {
      cidV1 = cid.toV1();
    } else {
      cidV1 = cid;
    }

    // Konversi CID versi 1 ke base32
    const cidBase32 = cidV1.toString('base32');

    console.log(`File berhasil diunggah ke IPFS.`);
    console.log(`CID Base58: ${cidBase58}`);
    console.log(`CID Base32: ${cidBase32}`);
  } catch (error) {
    console.error('Error mengunggah file ke IPFS:', error);
  }
}

// Path ke file yang ingin diunggah
const filePath = path.join(__dirname, 'tandankosong.jpg');  // Ganti 'aku.txt' dengan nama file yang ingin diunggah
uploadFile(filePath);

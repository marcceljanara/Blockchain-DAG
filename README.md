## How to Run
To use this application, use the following command:
```bash
git clone https://github.com/marcceljanara/Blockchain-DAG.git
```

To generate seed phrase
```bash
node create-nomic.js
```
Copy seed phrase, then paste in .env 
```bash
MNEMONIC = {seedphrase}
```
To setup a wallet, execute the command below.
```bash
node setup-account.js
```
To migrate an account, please run the program below.
```bash
node migrate.mjs
```

To create an NFT, please run the command:
```bash
node create-nft.js
```

There are 2 programs, namely create-nft.js and create-nft-models.js
which have different metadata, namely the first sends the image format while the second is a model transfer.

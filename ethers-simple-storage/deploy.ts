import { ethers } from "ethers";
import * as fs from "fs";
import { config } from "dotenv";

config();

async function main() {
  //http://127.0.0.1:7545
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  // Forma de criar uma wallet sem a private key encriptada(encryptKey.js)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
  // const wallet = ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD
  // ).connect(provider);

  const abi = fs.readFileSync("./SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync("./SimpleStorage.bin", "utf8");
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");
  const contract = await contractFactory.deploy();
  await contract.deploymentTransaction()?.wait();
  console.log(`Contract deployed to: ${contract.getAddress()}`);
  //const transactionReceipt = await contract.deploymentTransaction().wait(1);

  // console.log("Let's deploy with only transaction data!");
  // const nonce = await wallet.getNonce();
  // const tx = {
  //   nonce: nonce,
  //   gasPrice: "20000000000",
  //   gasLimit: "1000000",
  //   to: null,
  //   value: "0",
  //   data: "0x" + binary,
  //   chainId: "1337",
  // };

  // const sentTxResponse = await wallet.sendTransaction(tx);
  // await sentTxResponse.wait(1);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const currentFavoriteNumber = await contract.retrieve();
  console.log(currentFavoriteNumber);
  const transactionResponse = await contract.store(7);
  const transactionReceipt = await transactionResponse.wait(1);
  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Favorite number is: ${updatedFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

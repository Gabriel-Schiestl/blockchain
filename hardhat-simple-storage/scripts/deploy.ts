import { config } from "dotenv";
import { network, tasks } from "hardhat";

config();

async function main() {
  const { ethers } = await network.connect();
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.waitForDeployment();
  console.log(
    `Contract deployed to address: ${await simpleStorage.getAddress()}`,
  );
  const net = await ethers.provider.getNetwork();
  if (net.chainId === 11155111n && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deploymentTransaction()?.wait(6);
    await verify(await simpleStorage.getAddress(), []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current Value is: ${currentValue}`);

  const transactionResponse = await simpleStorage.store(7);
  await transactionResponse.wait();
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated Value is: ${updatedValue}`);
}

async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contract...");
  try {
    await tasks.getTask("verify").run({
      address: contractAddress,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified.");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

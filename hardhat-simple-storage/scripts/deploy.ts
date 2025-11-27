import { config } from "dotenv";
import { network, tasks } from "hardhat";

config();

async function main() {
  const { ethers } = await network.connect({
    network: "sepolia",
    chainType: "l1",
  });
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
}

async function verify(contractAddress: string, args: any[]) {
  console.log("Verifying contract...");
  try {
    await tasks.getTask("verify:verify").run({
      address: contractAddress,
      constructorArguments: args,
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

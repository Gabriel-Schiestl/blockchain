import { HardhatRuntimeEnvironment } from "hardhat/types/hre";

interface BlockNumberTaskArguments {
  // No arguments for this task
}

export default async function (
  taskArguments: BlockNumberTaskArguments,
  hre: HardhatRuntimeEnvironment,
) {
  const { ethers } = await hre.network.connect();
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Current block number: ${blockNumber}`);
}

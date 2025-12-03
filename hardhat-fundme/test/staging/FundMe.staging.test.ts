import { expect } from "chai";
import { network } from "hardhat";
import { FundMe } from "../../types/ethers-contracts/FundMe.js";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { developmentChains } from "../../hardhat.config.js";

const { ethers, networkName } = await network.connect();

developmentChains.includes(networkName)
  ? describe.skip
  : describe("FundMe Staging Tests", function () {
      let fundMe: FundMe;
      let deployer: HardhatEthersSigner;

      beforeEach(async function () {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];

        const FundMeFactory = await ethers.getContractFactory("FundMe");
        fundMe = FundMeFactory.attach(await deployer.getAddress()) as FundMe;
      });

      describe("fundMe", function () {
        it("allows people to fund and withdraw", async function () {
          const sendValue = 1_000000000000000000n; // 1 ETH
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAmountFundedByAddress(
            await deployer.getAddress()
          );
          expect(response).to.equal(sendValue);

          await fundMe.withdraw();
          const endingBalance = await ethers.provider.getBalance(
            await fundMe.getAddress()
          );
          expect(endingBalance).to.equal(0n);
        });
      });
    });

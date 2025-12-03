import { expect } from "chai";
import { network } from "hardhat";
import { FundMe } from "../../types/ethers-contracts/FundMe.js";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/types";
import { MockV3 } from "../../types/ethers-contracts/index.js";

const { ethers } = await network.connect();

describe("FundMe", function () {
  let fundMe: FundMe;
  let deployer: HardhatEthersSigner;
  let mockV3Aggregator: MockV3;

  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];

    const MockV3Factory = await ethers.getContractFactory("MockV3");
    mockV3Aggregator = (await MockV3Factory.deploy(
      8,
      2000_00000000n
    )) as MockV3;
    await mockV3Aggregator.waitForDeployment();

    const FundMeFactory = await ethers.getContractFactory("FundMe");
    const mockAddress = await mockV3Aggregator.getAddress();
    fundMe = (await FundMeFactory.deploy(mockAddress)) as FundMe;
    await fundMe.waitForDeployment();
  });

  describe("constructor", function () {
    it("sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed();
      const address = await mockV3Aggregator.getAddress();
      expect(response).equal(address);
    });
  });

  describe("fund", function () {
    it("fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("updates the amount funded data structure", async function () {
      const sendValue = 1_000000000000000000n; // 1 ETH
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmountFunded(
        await deployer.getAddress()
      );
      expect(response).to.equal(sendValue);
    });

    it("adds funder to array of funders", async function () {
      const sendValue = 1_000000000000000000n; // 1 ETH
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.s_funders(0);
      expect(funder).to.equal(await deployer.getAddress());
    });
  });

  describe("withdraw", function () {
    beforeEach(async function () {
      const sendValue = 1_000000000000000000n; // 1 ETH
      await fundMe.fund({ value: sendValue });
    });

    it("fails if a non-owner tries to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedFundMe = fundMe.connect(attacker);
      await expect(
        attackerConnectedFundMe.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });

    it("withdraws ETH from a single funder", async function () {
      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, gasPrice } = transactionReceipt!;
      const gasCost = gasUsed * gasPrice;

      const endingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      expect(endingFundMeBalance).to.equal(0n);
      expect(startingFundMeBalance + startingDeployerBalance).to.equal(
        endingDeployerBalance + gasCost
      );
    });

    it("withdraws ETH from multiple funders", async function () {
      const accounts = await ethers.getSigners();
      const fundersCount = 5;
      const sendValue = 1_000000000000000000n;

      for (let i = 1; i <= fundersCount; i++) {
        await fundMe.connect(accounts[i]).fund({ value: sendValue });
      }

      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait();
      const gasUsed = transactionReceipt!.gasUsed;
      const effectiveGasPrice =
        (transactionReceipt as any).effectiveGasPrice ??
        transactionReceipt!.gasPrice;
      const gasCost = gasUsed * effectiveGasPrice;

      const endingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      expect(endingFundMeBalance).to.equal(0n);
      expect(startingFundMeBalance + startingDeployerBalance).to.equal(
        endingDeployerBalance + gasCost
      );

      for (let i = 1; i <= fundersCount; i++) {
        const funded = await fundMe.s_addressToAmountFunded(
          await accounts[i].getAddress()
        );
        expect(funded).to.equal(0n);
      }
    });
  });

  describe("cheaperWithdraw", function () {
    beforeEach(async function () {
      const sendValue = 1_000000000000000000n; // 1 ETH
      await fundMe.fund({ value: sendValue });
    });

    it("fails if a non-owner tries to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedFundMe = fundMe.connect(attacker);
      await expect(
        attackerConnectedFundMe.cheaperWithdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });

    it("withdraws ETH from a single funder", async function () {
      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, gasPrice } = transactionReceipt!;
      const gasCost = gasUsed * gasPrice;

      const endingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      expect(endingFundMeBalance).to.equal(0n);
      expect(startingFundMeBalance + startingDeployerBalance).to.equal(
        endingDeployerBalance + gasCost
      );
    });

    it("withdraws ETH from multiple funders", async function () {
      const accounts = await ethers.getSigners();
      const fundersCount = 5;
      const sendValue = 1_000000000000000000n;

      for (let i = 1; i <= fundersCount; i++) {
        await fundMe.connect(accounts[i]).fund({ value: sendValue });
      }

      const startingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const startingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait();
      const gasUsed = transactionReceipt!.gasUsed;
      const effectiveGasPrice =
        (transactionReceipt as any).effectiveGasPrice ??
        transactionReceipt!.gasPrice;
      const gasCost = gasUsed * effectiveGasPrice;

      const endingFundMeBalance = await ethers.provider.getBalance(
        await fundMe.getAddress()
      );
      const endingDeployerBalance = await ethers.provider.getBalance(
        await deployer.getAddress()
      );

      expect(endingFundMeBalance).to.equal(0n);
      expect(startingFundMeBalance + startingDeployerBalance).to.equal(
        endingDeployerBalance + gasCost
      );

      for (let i = 1; i <= fundersCount; i++) {
        const funded = await fundMe.s_addressToAmountFunded(
          await accounts[i].getAddress()
        );
        expect(funded).to.equal(0n);
      }
    });
  });

  describe("fallback and receive", function () {
    it("receive function is called when ETH is sent without data", async function () {
      const sendValue = ethers.parseEther("1");

      await deployer.sendTransaction({
        to: await fundMe.getAddress(),
        value: sendValue,
      });

      const balance = await fundMe.s_addressToAmountFunded(deployer.address);
      expect(balance).to.equal(sendValue);
    });

    it("fallback function is called when ETH is sent with data", async function () {
      const sendValue = ethers.parseEther("1");

      await deployer.sendTransaction({
        to: await fundMe.getAddress(),
        value: sendValue,
        data: "0x1234",
      });

      const balance = await fundMe.s_addressToAmountFunded(deployer.address);
      expect(balance).to.equal(sendValue);
    });

    it("receive function fails if not enough ETH is sent", async function () {
      const sendValue = ethers.parseEther("0.001");

      await expect(
        deployer.sendTransaction({
          to: await fundMe.getAddress(),
          value: sendValue,
        })
      ).to.be.revertedWith("You need to spend more ETH!");
    });
  });
});

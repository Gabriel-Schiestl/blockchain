import { expect } from "chai";
import { network } from "hardhat";
import { SimpleStorage } from "../types/ethers-contracts/SimpleStorage.js";

const { ethers } = await network.connect();

describe("SimpleStorage", function () {
  let simpleStorage: SimpleStorage;

  beforeEach(async function () {
    simpleStorage = await ethers.deployContract("SimpleStorage");
  });

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve();
    expect(currentValue).to.equal(0n);
  });

  it("Should update when we call store", async function () {
    const expectedValue = 7n;
    const transactionResponse = await simpleStorage.store(expectedValue);
    await transactionResponse.wait();

    const currentValue = await simpleStorage.retrieve();
    expect(currentValue).to.equal(expectedValue);
  });
});

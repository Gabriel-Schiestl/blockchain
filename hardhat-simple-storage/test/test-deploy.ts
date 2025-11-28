import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("SimpleStorage", function () {
  this.beforeEach(async function () {
    this.simpleStorage = await ethers.deployContract("SimpleStorage");
  });

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await this.simpleStorage.retrieve();
    expect(currentValue).equals(0n);
  });

  // run only this test
  it.only("Should update when we call store", async function () {
    const expectedValue = 7n;
    const transactionResponse = await this.simpleStorage.store(expectedValue);
    await transactionResponse.wait();

    const currentValue = await this.simpleStorage.retrieve();

    expect(currentValue).equals(expectedValue);
  });
});

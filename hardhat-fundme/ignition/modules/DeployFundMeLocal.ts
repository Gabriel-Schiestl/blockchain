import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployFundMeLocal", (m) => {
  const account = m.getAccount(0);

  const mockDecimals = m.getParameter("mockDecimals", 8);
  const mockInitialPriceFeed = m.getParameter(
    "mockInitialPriceFeed",
    2000_00000000n
  );

  const mockPriceFeed = m.contract("MockV3", [
    mockDecimals,
    mockInitialPriceFeed,
  ]);

  const fundMe = m.contract("FundMe", [mockPriceFeed], {
    from: account,
  });

  return { fundMe, mockPriceFeed };
});

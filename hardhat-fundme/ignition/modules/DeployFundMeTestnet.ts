import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployFundMeTestnet", (m) => {
  const account = m.getAccount(0);

  const priceFeedAddress = m.getParameter(
    "priceFeedAddress",
    "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  );

  const fundMe = m.contract("FundMe", [priceFeedAddress], {
    from: account,
  });

  return { fundMe };
});

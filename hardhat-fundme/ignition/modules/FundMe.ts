import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("FundMeModule", (m) => {
  const account = m.getAccount(1);

  const library = m.library("PriceConverter");
  const fundMe = m.contract("FundMe", [], {
    libraries: {
      PriceConverter: library,
    },
    from: account,
  });

  return { fundMe };
});

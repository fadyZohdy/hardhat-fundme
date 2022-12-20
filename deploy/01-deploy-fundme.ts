import { HardhatRuntimeEnvironment } from "hardhat/types";
import { network } from "hardhat";

import { networkConfig, localChains } from "../helper-hardhat.config";

const deployFunc = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deployer } = await getNamedAccounts();

  let ethUsdPriceFeedAddress: string;

  if (localChains.includes(network.name)) {
    const v3Agg = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = v3Agg.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeedAddress;
  }

  await deployments.deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: localChains.includes(network.name)
      ? 1
      : networkConfig[network.name].blockConfirmations,
  });
};

export default deployFunc;

deployFunc.tags = ["all", "fundme"];

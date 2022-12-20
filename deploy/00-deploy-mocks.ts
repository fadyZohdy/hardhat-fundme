import { DeploymentsExtension } from "hardhat-deploy/types";
import { network } from "hardhat";

import { localChains } from "../helper-hardhat.config";

const deployFunc = async ({
  getNamedAccounts,
  deployments,
}: {
  getNamedAccounts: () => Promise<{ [name: string]: string }>;
  deployments: DeploymentsExtension;
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (localChains.includes(network.name)) {
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [8, 200000000000],
    });
  }
};

export default deployFunc;
deployFunc.tags = ["all", "mocks"];

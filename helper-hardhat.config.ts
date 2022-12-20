export interface NetworkConfigItem {
  ethUsdPriceFeedAddress: string;
  blockConfirmations: number;
}

export interface NetworkConfig {
  [key: string]: NetworkConfigItem;
}

export const networkConfig: NetworkConfig = {
  goerli: {
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    blockConfirmations: 6,
  },
};

export const localChains = ["localhost", "hardhat"];

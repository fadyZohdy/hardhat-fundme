// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    address internal constant LINK_ETH_USD_CONTRACT = 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e;

    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
        (,int price ,,,) = priceFeed.latestRoundData();
        return uint256(price) * 10**10;
    }

    function getConversionRate(uint256 ethValue, AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 price = getPrice(priceFeed);
        return (ethValue * price) / 10**18;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "./PriceConverter.sol";

error FundMe__NotOwner();

error FundMe__CallFailed();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MIN_USD = 50 * 10 ** 18;

    address[] public funders;
    mapping(address => uint256) public fundersToFunds;

    address public immutable i_owner;

    AggregatorV3Interface public immutable i_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        uint256 value = msg.value;
        require(
            value.getConversionRate(i_priceFeed) >= MIN_USD,
            "min funding is 50 USD"
        );
        funders.push(msg.sender);
        fundersToFunds[msg.sender] += value;
    }

    function withdraw() public payable onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            fundersToFunds[funders[i]] = 0;
        }
        funders = new address[](0);

        (bool sent, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );

        if (!sent) {
            revert FundMe__CallFailed();
        }
    }
}

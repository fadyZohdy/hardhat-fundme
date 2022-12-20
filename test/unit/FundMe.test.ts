import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
import { Contract } from "ethers";
import { FundMe, FundMe__factory } from "../../typechain-types";

describe("FundMe", async () => {
  let fundMe: FundMe;
  let deployer: string;
  let v3Aggregator: Contract;
  const sendAmount = ethers.utils.parseEther("1");
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployer);
    v3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async () => {
    it("gets aggregator address correctly", async () => {
      const aggAddr = await fundMe.i_priceFeed();
      assert.equal(aggAddr, v3Aggregator.address);
    });
  });

  describe("fund", async () => {
    it("fails if you don't send enough eth", async () => {
      await expect(fundMe.fund()).to.be.revertedWithCustomError(
        fundMe,
        "FundMe__BelowMin"
      );
    });

    it("succeeds if you send more than min and updates state", async () => {
      await fundMe.fund({ value: sendAmount });

      const funder = await fundMe.s_funders("0");
      assert.equal(funder, deployer);

      const funds = await fundMe.s_fundersToFunds(funder);
      assert.equal(funds.toString(), sendAmount.toString());
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendAmount });
    });

    it("withdraws ETH from a single founder", async () => {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingFunderBalance = await fundMe.provider.getBalance(deployer);

      const txnResponse = await fundMe.withdraw();
      const txnReceipt = await txnResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = txnReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingFunderBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingFundMeBalance.add(startingFunderBalance).toString(),
        endingFunderBalance.add(gasCost).toString()
      );
    });

    it("only allows owner to withdraw funds", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });
});

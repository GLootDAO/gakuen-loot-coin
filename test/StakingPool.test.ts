import {expect, use} from 'chai';
import "@nomiclabs/hardhat-waffle";
import {ethers, waffle} from "hardhat";
import {Contract, utils, Signer} from "ethers";

use(waffle.solidity);

const ONE_MILLION = utils.parseEther('1000000');

describe("StakingPool", () => {
    let aliceSigner: Signer, bobSigner: Signer;
    let alice: string, bob: string;
    let StakingPool: Contract;
    let GCoin: Contract;
    let CFC: Contract;
    let GLoot: Contract;

    beforeEach(async () => {
        const signers = await ethers.getSigners();
        [aliceSigner, bobSigner] = signers;
        [alice, bob] = await Promise.all(signers.map(s => s.getAddress()));

        const gloot = await ethers.getContractFactory("GakuenLoot");
        GLoot = await gloot.deploy();
        await GLoot.mint(alice, 0);
        await GLoot.mint(bob, 1);

        const gcoin = await ethers.getContractFactory("GakuenLootCoin");
        GCoin = await gcoin.deploy(GLoot.address);
        await GCoin.mint(alice, 0);


        const stakingPool = await ethers.getContractFactory("StakingPool");
        StakingPool = await stakingPool.deploy(GCoin.address);

        const cfc = await ethers.getContractFactory("CompletelyFakeCoin");
        CFC = await cfc.deploy(StakingPool.address);

        await StakingPool.setCFCAddress(CFC.address);

        await CFC.mint(ONE_MILLION);
    });


    describe("stake()", async () => {
        it("success", async () => {
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount);
            await StakingPool.stake(stakeAmount);

            const stakeInfo = await StakingPool.getStakeInfo(alice);

            const gcoinBalance = await GCoin.balanceOf(alice);
            expect(gcoinBalance).to.eq(0);

            expect(stakeInfo.amount).to.eq(stakeAmount);
            expect(stakeInfo.stakeAt).to.not.eq(0);
            expect(stakeInfo.claimAt).to.eq(0);

            const poolBalance = await GCoin.balanceOf(StakingPool.address);
            expect(poolBalance).to.eq(stakeAmount);
        });

        it("Expecting to fail because of insufficient balance", async () => {
            const stakeAmount = utils.parseEther('100000');

            const tx = StakingPool.connect(bobSigner).stake(stakeAmount);
            await expect(tx).to.be.revertedWith("Your gcoin balance is insufficient");
        });

        it("Staking is not possible within 24h, so expect it to fail.", async () => {
            await GCoin.connect(bobSigner).mint(alice, 1);
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount.mul(2));
            await StakingPool.stake(stakeAmount);
            await expect(StakingPool.stake(stakeAmount)).to.be.revertedWith('Staking is only possible once every 24h.');
        });

        it("Cannot stake in amounts less than stakeLimit", async () => {
            const notEnoughStakeAmount = utils.parseEther('10000');
            await GCoin.approve(StakingPool.address, notEnoughStakeAmount);
            await expect(StakingPool.stake(notEnoughStakeAmount)).to.be.revertedWith("Staking can be done with an amount of stakeLimit or higher.");
        });
    });

    describe("claim()", async () => {
        it("success", async () => {
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount);
            await StakingPool.stake(stakeAmount);

            await StakingPool.claim();

            const aliceBalance = await CFC.balanceOf(alice);

            // stakeAmount * 20 / 10
            expect(aliceBalance).to.eq(stakeAmount.mul(2));
        });

        it("you can't claim because you have no balance.", async () => {
            expect(StakingPool.claim()).to.be.revertedWith("You must have a balance of zero or more to claim");
        });

        it("Alice can't reclaim it because it hasn't been 24 hours.", async () => {
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount);
            await StakingPool.stake(stakeAmount);

            await StakingPool.claim();
            expect(StakingPool.claim()).to.be.revertedWith("Claim is only possible once every 24h.");
        });

        it("Alice can reclaim it because it has been 24 hours.", async () => {
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount);
            await StakingPool.stake(stakeAmount);

            await StakingPool.claim();
            await ethers.provider.send("evm_increaseTime", [24 * 3600]);

            await StakingPool.claim();

            const aliceBalance = await CFC.balanceOf(alice);

            // stakeAmount * 20 / 10 * 2
            expect(aliceBalance).to.eq(stakeAmount.mul(4));
        });
    });

    describe("withdraw()", async () => {
        it("success", async () => {
            const stakeAmount = utils.parseEther('100000');
            await GCoin.approve(StakingPool.address, stakeAmount);
            await StakingPool.stake(stakeAmount);

            // bob can't withdraw because no balance
            expect(StakingPool.connect(bobSigner).withdraw()).to.be.revertedWith("You must have a balance of zero or more to withdraw");

            await StakingPool.withdraw();

            const aliceBalance = await GCoin.balanceOf(alice);

            expect(aliceBalance).to.eq(stakeAmount);

            const poolBalance = await GCoin.balanceOf(StakingPool.address);

            expect(poolBalance).to.eq(0);
        });

        it("you can't claim because you have no balance.", async () => {
            expect(StakingPool.withdraw()).to.be.revertedWith("You must have a balance of zero or more to withdraw");
        });
    });
});
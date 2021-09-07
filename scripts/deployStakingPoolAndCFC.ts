import hre from "hardhat";
import "@nomiclabs/hardhat-ethers";
import {utils} from "ethers";

const ONE_MILLION = utils.parseEther('1000000');

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log(`balance: ${await signer.getBalance()}`);

    const StakingPool = await hre.ethers.getContractFactory("StakingPool");
    const gcoinAddress = "0x309a47D5b799a5AD834e445Dc202Db7e231E9924";
    const stakingPool = await StakingPool.deploy(gcoinAddress);

    const CFC = await hre.ethers.getContractFactory("CompletelyFakeCoin");
    const cfc = await CFC.deploy(stakingPool.address);

    await stakingPool.setCFCAddress(cfc.address);

    await cfc.mint(stakingPool.address, ONE_MILLION);

    console.log("CompletelyFakeCoin deployed to:", cfc.address);
    console.log("StakingPool deployed to:", stakingPool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

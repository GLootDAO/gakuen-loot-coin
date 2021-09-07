import hre from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log(`balance: ${await signer.getBalance()}`);

    const GakuenLootCoin = await hre.ethers.getContractFactory("GakuenLootCoin");
    const coin = await GakuenLootCoin.deploy("0x9dC9e20E35F7Af608C4e7233a95DB50bDF5f8F9e");
    await coin.deployed();

    console.log("GakuenLootCoin deployed to:", coin.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

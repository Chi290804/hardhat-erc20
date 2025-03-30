const hre = require("hardhat");

async function main() {
    const initialSupply = hre.ethers.parseUnits("1000", 18);

    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(initialSupply);

    await myToken.waitForDeployment();
    console.log(`MyToken deployed to: ${await myToken.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

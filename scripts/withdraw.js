const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");
require("dotenv").config();

const { CONTRACT_ADDRESS, GOERLI_API_KEY, PRIVATE_KEY } = process.env;

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // get contract abi
  const contractABI = abi.abi;

  // get node and wallet connection
  const provider = new hre.ethers.providers.AlchemyProvider(
    "goerli",
    GOERLI_API_KEY
  );

  // setup signer
  const signer = new hre.ethers.Wallet(PRIVATE_KEY, provider);

  // instantiate connected contract
  const buyMeACoffee = new hre.ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer
  );

  // check starting balance
  console.log(
    `current balance of owner: `,
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log(
    `current balance of contract: `,
    await getBalance(provider, buyMeACoffee.address),
    "ETH"
  );

  // withdraw funds
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds...");
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw");
  }

  // check ending balance of owner
  console.log(
    `current balance of owner: `,
    await getBalance(provider, signer.address),
    "ETH"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

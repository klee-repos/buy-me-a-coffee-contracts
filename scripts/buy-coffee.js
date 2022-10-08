const hardhat = require("hardhat");

async function getBalance(address) {
  const balanceBigInt = await hardhat.ethers.provider.getBalance(address);
  return hardhat.ethers.utils.formatEther(balanceBigInt);
}

async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance`, await getBalance(address));
    idx++;
  }
}

async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: ${message}`
    );
  }
}

async function main() {
  const [owner, tipper, tipper2, tipper3] = await hardhat.ethers.getSigners();

  // get the contract to deploy
  const BuyMeACoffee = await hardhat.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // deploy contract
  await buyMeACoffee.deployed();
  console.log(`BuyMeCofee deployed at:`, buyMeACoffee.address);

  // check balances of owner, tipper, and contract
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("=== start ===");
  await printBalances(addresses);

  // buy owner coffee
  const tip = { value: hardhat.ethers.utils.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("Columbus", "Go Bucks", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Memphis", "Thanks!", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Miami", "Very cool", tip);

  // check balances
  console.log("=== bought coffee ===");
  await printBalances(addresses);

  // withdraw
  await buyMeACoffee.connect(owner).withdrawTips();

  // check balance after withdrawal
  console.log("=== withdraw tips ===");
  await printBalances(addresses);

  // check memos
  console.log("=== memos ===");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

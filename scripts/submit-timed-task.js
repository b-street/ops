/* eslint-disable no-undef */
const { ethers } = require("hardhat");

async function main() {
  [user] = await hre.ethers.getSigners();
  userAddress = await user.getAddress();
  const COUNTER = (await hre.ethers.getContract("CounterTimedTask")).address;
  const RESOLVER = (await hre.ethers.getContract("Forwarder")).address;

  console.log("Submitting Task");

  console.log("Counter address: ", COUNTER);
  console.log("Counter resolver address: ", RESOLVER);

  const OPS = (await hre.ethers.getContract("Ops")).address;

  const ops = await ethers.getContractAt("Ops", OPS, user);
  const counter = await ethers.getContractAt("Counter", COUNTER, user);
  const forwarder = await ethers.getContractAt("Forwarder", RESOLVER, user);

  const selector = await ops.getSelector("increaseCount(uint256)");
  const execData = counter.interface.encodeFunctionData("increaseCount", [100]);
  const resolverData = forwarder.interface.encodeFunctionData("checker", [
    execData,
  ]);

  const interval = 3 * 60;

  const txn = await ops.createTimedTask(
    0,
    interval,
    counter.address,
    selector,
    forwarder.address,
    resolverData,
    ethers.constants.AddressZero,
    true
  );

  const res = await txn.wait();
  console.log(res);

  console.log("Task Submitted");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

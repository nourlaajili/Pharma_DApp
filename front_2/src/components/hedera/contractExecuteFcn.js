import abi from "../../contracts/abi.js";
import { ethers } from "ethers";

async function contractExecuteFcn(walletData,  functionName, functionArgs, gasLimit) {
  const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
  console.log(`\n=======================================`);
  console.log(`- Executing the smart contract...🟠`);

  // ETHERS PROVIDER AND SIGNER
  const provider = walletData[1];
  const signer = await provider.getSigner(); // Ensure the signer is properly initialized

  // EXECUTE THE SMART CONTRACT
  let txHash;
  try {
    // Initialize the contract
    const myContract = new ethers.Contract(contractAddress, abi, signer);

    // Call the contract function
    const tx = await myContract[functionName](...functionArgs, { gasLimit: gasLimit });
    const rx = await tx.wait();

    // Check if the transaction was successful
    if (rx.status === 1) {
      txHash = tx.hash; // Get the transaction hash
      console.log(`- Contract executed. Transaction hash: \n${txHash} ✅`);
    } else {
      console.log(`- Transaction failed. Receipt status: ${rx.status}`);
      throw new Error("Transaction failed");
    }
  } catch (executeError) {
    console.log(`- ${executeError.message.toString()}`);
    throw executeError;
  }

  return [txHash, null]; // Return transaction hash and null for finalCount (if not needed)
}

export default contractExecuteFcn;
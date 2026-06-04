import { createPublicClient, http, encodeFunctionData, keccak256, toHex } from 'viem';
import { polygon } from 'viem/chains';

async function main() {
  console.log("Building a low-level transaction payload...");

  // --- Contract and Target Details ---
  const wGhstContractAddress = '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7';
  const recipientAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  // wGHST has 18 decimals, so 150 tokens = 150 * 10^18
  const amount = 150n * 10n**18n;

  // --- Step 1: The ABI ---
  // We only need the ABI for the specific function we are calling.
  // This is how `viem` knows how to encode the data.
  const transferAbi = [
    {
      "name": "transfer",
      "type": "function",
      "stateMutability": "nonpayable",
      "inputs": [
        { "name": "to", "type": "address" },
        { "name": "amount", "type": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "bool" }
      ]
    }
  ];

  // --- Step 2: Manually Constructing the 'data' Payload ---
  // viem's encodeFunctionData does this all in one step, but let's see the parts.

  const dataPayload = encodeFunctionData({
    abi: transferAbi,
    functionName: 'transfer',
    args: [recipientAddress, amount]
  });

  console.log("\n--- Payload Breakdown ---");
  const functionSelector = dataPayload.slice(0, 10); // First 4 bytes (10 hex chars)
  console.log(`Function Selector: ${functionSelector}`); // Should be 0xa9059cbb

  const encodedArgs = `0x${dataPayload.slice(10)}`;
  console.log(`Encoded Arguments: ${encodedArgs}`);

  console.log("\n--- Full Data Payload ---");
  console.log(dataPayload);
  // Expected Output: 0xa9059cbb000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000080c951337e4470000

  // Now, let's see how to use this payload.
  await usePayloadForInteraction(wGhstContractAddress, dataPayload);
}

async function usePayloadForInteraction(contractAddress, data) {
  // We'll use a public client to simulate calls (read-only)
  // You would use a walletClient to send a real transaction
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http() // Uses default public RPC
  });

  // =================================================================
  // A) Read-Only Interaction (`eth_call`)
  // =================================================================
  // Let's create a payload for a `view` function like `balanceOf`
  const balanceOfAbi = [{ "name": "balanceOf", "type": "function", "stateMutability": "view", "inputs": [{"name": "account", "type": "address"}], "outputs": [{"name": "", "type": "uint256"}]}];

  const balanceOfData = encodeFunctionData({
    abi: balanceOfAbi,
    functionName: 'balanceOf',
    args: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
  });

  console.log("\n--- Using `eth_call` for a read-only query ---");
  console.log(`Querying balance for Vitalik with data: ${balanceOfData}`);

  const balanceResult = await publicClient.call({
    to: contractAddress,
    data: balanceOfData
  });

  console.log(`Raw hex result from eth_call: ${balanceResult.data}`); // e.g., 0x000...
  // The result is also ABI-encoded, so you need to decode it.
  const balance = BigInt(balanceResult.data);
  console.log(`Decoded balance: ${balance} (wei)`);
  console.log(`Decoded balance: ${Number(balance) / 1e18} wGHST`);


  // =================================================================
  // B) State-Changing Interaction (`eth_sendRawTransaction`)
  // =================================================================
  console.log("\n--- Using the 'transfer' payload in a real transaction ---");
  console.log("To send a real transaction, you would use a Wallet Client (e.g., from a user's wallet).");
  console.log("The call would look like this (this part is pseudo-code and will not run):");

  /*
  // This is a conceptual example. You'd get the walletClient from a library like RainbowKit or by using private keys.
  import { createWalletClient, custom } from 'viem';
  const walletClient = createWalletClient({ chain: polygon, transport: custom(window.ethereum) });
  const [account] = await walletClient.getAddresses();

  console.log(`\nPreparing to send transaction from: ${account}`);

  const txHash = await walletClient.sendTransaction({
    to: contractAddress,
    data: data, // Our manually crafted data payload!
    value: 0n, // Not sending any native MATIC
    // gas, gasPrice, etc. would be estimated by the wallet
  });

  console.log(`Transaction sent! Hash: ${txHash}`);
  */
}


main().catch(console.error);
import prompts from "prompts";
import yargs from "yargs";
import { WALLETS } from "./wallets";
import { createWalletClient, getContract, http, publicActions } from "viem";
import { lightlinkPegasus } from "viem/chains";

async function main() {
  const args = await yargs.command(
    "$0",
    "start dice poker client",
    (_yargs) => {
      _yargs.option("wallet", {
        alias: "w",
        type: "string",
        description: "desired wallet",
      });
    }
  ).argv;

  const wallet = WALLETS[args.wallet as keyof typeof WALLETS];

  const client = createWalletClient({
    chain: lightlinkPegasus,
    transport: http(),
    account: privateKeyToAccount(wallet),
  }).extend(publicActions);

  const contract = getContract({
    address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    abi: [],
    client,
  });

  // Prompt the user for input
  const response = await prompts({
    type: "text",
    name: "input",
    message: "Enter your input:",
  });

  // Process the user's input
  const userInput = response.input;
  console.log("User input:", userInput);

  // Your code to interact with the smart contract based on the user's input goes here

  // Exit the app
  process.exit();
}

main();
function privateKeyToAccount(wallet: string): any {
  throw new Error("Function not implemented.");
}

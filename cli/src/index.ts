import yargs from "yargs";
import { WALLETS } from "./wallets";
import {
  createWalletClient,
  getContract,
  http,
  parseEther,
  publicActions,
} from "viem";
import { lightlinkPegasus } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { terminal as term } from "terminal-kit";
import { ABI } from "./static/abi";

async function main() {
  let waitForStartInterval: NodeJS.Timeout;

  function terminate() {
    term.grabInput(false);
    clearInterval(waitForStartInterval);

    setTimeout(function () {
      process.exit();
    }, 100);
  }

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

  const client = createWalletClient({
    chain: lightlinkPegasus,
    transport: http(),
    account: privateKeyToAccount(WALLETS[args.wallet as keyof typeof WALLETS]),
  }).extend(publicActions);

  term.bold.cyan(`Logged in as ${args.wallet} (${client.account.address})\n`);

  term.grabInput({ mouse: "button" });

  term.on("terminal", function (name: any, data: any) {
    console.log("'terminal' event:", name, data);
  });

  const contract = getContract({
    address: "0xd388B99E2d035a134cA2C7fd1009d32061FB74df",
    abi: ABI,
    client,
  });

  let started = false;
  let joined = false;

  const joinGame = async () => {
    try {
      if (started) {
        term.red("Game already started.\n");
        return;
      }
      await contract.write.joinGame({
        value: parseEther("0.00001"),
        gasPrice: 0n,
      });
      joined = true;
      term.green("You joined the game.\n");
    } catch (error) {
      term.red(`Error: ${(error as any)?.shortMessage ?? error}\n`);
    }
  };

  const showDices = async () => {
    try {
      const dices = await contract.read.getPlayerDices([
        client.account.address,
      ]);
      term.green(`Your dices: ${dices.map((d) => Number(d)).join(",")}\n`);
    } catch (error) {
      term.red(`Error: ${(error as any)?.shortMessage ?? error}\n`);
    }
  };

  const rollDice = async () => {
    try {
      await contract.write.rollDice({ gasPrice: 0n });
      term.green("You rolled the dice.\n");
    } catch (error) {
      term.red(`Error: ${(error as any)?.shortMessage ?? error}\n`);
    }
  };

  const showNumberOfPlayers = async () => {
    try {
      const numberOfPlayers = await contract.read.players();
      term.green(`Number of players: ${numberOfPlayers}\n`);
    } catch (error) {
      term.red(`Error: ${(error as any)?.shortMessage ?? error}\n`);
    }
  };

  term.green("Hit CTRL-C to quit.\n\n");
  term.green("Hit CTRL-G to enter the game.\n\n");
  term.green("Hit CTRL-R to roll the dice.\n\n");
  term.green("Hit CTRL-P to show number of players.\n\n");
  term.green("Hit CTRL-D to show your dices.\n\n");

  term.on("key", function (name: string, matches: any, data: any) {
    if (name === "CTRL_C") {
      terminate();
    } else if (name === "CTRL_G") {
      if (joined) {
        term.red("You already joined the game.\n");
      } else {
        term.green("You trying to join the game.\n");
        joinGame();
      }
    } else if (name === "CTRL_R") {
      if (started) {
        term.green("You trying to roll the dice.\n");
        rollDice();
      } else {
        term.red("Game not started.\n");
      }
    } else if (name === "CTRL_P") {
      showNumberOfPlayers();
    } else if (name === "CTRL_D") {
      showDices();
    }
  });

  waitForStartInterval = setInterval(async () => {
    try {
      started = await contract.read.gameStarted();
    } catch (error) {}
  }, 1000);

  contract.watchEvent.GameStarted({
    poll: true,
    pollingInterval: 1000,
    onLogs: (logs) => {
      term.green("Game started, players can start betting.\n");
    },
  });

  contract.watchEvent.GameEnded({
    poll: true,
    pollingInterval: 1000,
    onLogs: (logs) => {
      if (logs[0].args.winner === client.account.address) {
        term.green("You win!\n");
      } else if (logs[0].args.winner !== client.account.address) {
        term.red("You lose!\n");
      }
    },
  });

  contract.watchEvent.DiceRolled({
    poll: true,
    pollingInterval: 1000,
    onLogs: (logs) => {
      if (logs[0].args.player !== client.account.address) {
        term.cyan(`Player ${logs[0].args.player} rolled the dices.\n`);
      }
    },
  });

  contract.watchEvent.PlayerJoined({
    poll: true,
    pollingInterval: 1000,
    onLogs: (logs) => {
      if (logs[0].args.player !== client.account.address) {
        term.cyan(`Player ${logs[0].args.player} joined the game.\n`);
      }
    },
  });
}

main();

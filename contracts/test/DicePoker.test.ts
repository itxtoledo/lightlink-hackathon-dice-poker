import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseGwei, parseEther } from "viem";
import {
  WalletClient,
  GetContractReturnType,
} from "@nomicfoundation/hardhat-viem/types";
import { DicePoker$Type } from "../artifacts/contracts/DicePoker.sol/DicePoker";

const FEE = parseEther("0.0001");

const getContractForAccount = async (
  contract: GetContractReturnType<DicePoker$Type["abi"]>,
  account: WalletClient
) => {
  const dicePokerAs = await hre.viem.getContractAt(
    "DicePoker",
    contract.address,
    { walletClient: account }
  );

  return dicePokerAs;
};

describe("DicePoker", function () {
  async function deployDicePokerFixture() {
    const dicePoker = await hre.viem.deployContract("DicePoker", [FEE]);

    const publicClient = await hre.viem.getPublicClient();

    const [owner, player1, player2] = await hre.viem.getWalletClients();

    return {
      owner,
      player1,
      player2,
      dicePoker,
      publicClient,
    };
  }

  it("Should allow players to join the game", async function () {
    const { dicePoker, player1 } = await deployDicePokerFixture();

    await (
      await getContractForAccount(dicePoker, player1)
    ).write.joinGame({
      value: FEE,
    });

    const players = await dicePoker.read.players();

    expect(players).to.equal(1n);
  });

  it("Should not allow the game to start with less than two players", async function () {
    const { dicePoker } = await deployDicePokerFixture();

    await expect(dicePoker.write.startGame()).to.be.rejectedWith(
      "Not enough players"
    );
  });

  it("Should start the game with enough players", async function () {
    const { dicePoker, player1, player2 } = await deployDicePokerFixture();
    await (
      await getContractForAccount(dicePoker, player1)
    ).write.joinGame({
      value: FEE,
    });
    await (
      await getContractForAccount(dicePoker, player2)
    ).write.joinGame({
      value: FEE,
    });

    await dicePoker.write.startGame();

    const gameStarted = await dicePoker.read.gameStarted();
    expect(gameStarted).to.be.true;
  });

  it("Should not allow players to roll dice if the game is not started", async function () {
    const { dicePoker } = await deployDicePokerFixture();
    await expect(dicePoker.write.rollDice()).to.be.rejectedWith(
      "Game not started"
    );
  });

  // Add more test cases based on your contract logic

  // Example: Test dice rolling logic

  // TODO verify this possibility
  // it("Should correctly roll dice and update player's dice values", async function () {
  //   const { dicePoker, player1 } = await deployDicePokerFixture();
  //   (await getContractForAccount(dicePoker, player1)).write.joinGame({
  //     value: FEE,
  //   });
  //   await dicePoker.write.startGame();

  //   (await getContractForAccount(dicePoker, player1)).write.rollDice();
  //   const playerDiceValues = await dicePoker.read.getPlayerDiceValues(
  //     player1.address
  //   );

  //   expect(playerDiceValues.length).to.equal(5); // Assuming 5 dice
  // });

  // Example: Test ending the game and transferring winnings

  it("Should end the game and transfer winnings to the winner", async function () {
    const publicClient = await hre.viem.getPublicClient();
    const { dicePoker, player1, player2 } = await deployDicePokerFixture();

    await (
      await getContractForAccount(dicePoker, player1)
    ).write.joinGame({
      value: FEE,
    });

    await (
      await getContractForAccount(dicePoker, player2)
    ).write.joinGame({
      value: FEE,
    });
    await dicePoker.write.startGame();

    await (await getContractForAccount(dicePoker, player1)).write.rollDice();
    await (await getContractForAccount(dicePoker, player2)).write.rollDice();

    const initialBalanceWinner = await publicClient.getBalance({
      address: player1.account.address,
    });

    await dicePoker.write.endGame();

    const finalBalanceWinner = await publicClient.getBalance({
      address: player1.account.address,
    });

    const pot = await dicePoker.read.pot();

    expect(finalBalanceWinner - initialBalanceWinner).to.equal(pot);
  });
});

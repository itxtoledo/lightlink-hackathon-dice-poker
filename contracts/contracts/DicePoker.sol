// SPDX-License-Identifier: MIT
// Developed by:
// - Jether Rodrigues
// - Gustavo Toledo
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DicePoker is Ownable {
    struct Player {
        address playerAddress;
        uint256 currentBet;
        uint[] diceValues;
    }

    Player[] private _players;
    uint public betAmount;
    uint public pot;
    bool public gameStarted;

    // Event declarations
    event GameStarted();
    event PlayerJoined(address player);
    event DiceRolled(address player, uint[] diceValues);
    event GameEnded(address winner, uint winnings);

    // Constructor to initialize the contract
    constructor(uint _betAmount) Ownable(msg.sender) {
        betAmount = _betAmount;
        gameStarted = false;
    }

    function players() external view returns (uint) {
        return _players.length;
    }

    // Function to join the game
    function joinGame() public payable {
        require(msg.value == betAmount, "Incorrect bet amount");
        require(!gameStarted, "Game already started");

        _players.push(
            Player({
                playerAddress: msg.sender,
                currentBet: msg.value,
                diceValues: new uint[](0)
            })
        );

        pot += msg.value;
        emit PlayerJoined(msg.sender);
    }

    // Function to start the game
    function startGame() public onlyOwner {
        require(_players.length > 1, "Not enough players");
        gameStarted = true;
        emit GameStarted();
    }

    // Function to roll dice
    function rollDice() public {
        require(gameStarted, "Game not started");
        // This is a placeholder for dice rolling logic
        // In a real implementation, it should be a secure RNG
        uint[] memory diceResults = new uint[](5); // Assuming 5 dice
        for (uint i = 0; i < diceResults.length; i++) {
            diceResults[i] =
                (uint(
                    keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
                ) % 6) +
                1;
        }

        for (uint i = 0; i < _players.length; i++) {
            if (_players[i].playerAddress == msg.sender) {
                _players[i].diceValues = diceResults;
                break;
            }
        }

        emit DiceRolled(msg.sender, diceResults);
    }

    // Function to end the game and declare winner
    function endGame() public onlyOwner {
        require(gameStarted, "Game not started");

        uint highestTotal = 0;
        address winner;

        // Iterate through each player to calculate total dice values
        for (uint i = 0; i < _players.length; i++) {
            uint total = 0;

            for (uint j = 0; j < _players[i].diceValues.length; j++) {
                total += _players[i].diceValues[j];
            }

            // Check if the current total is greater than the highest total so far
            if (total > highestTotal) {
                highestTotal = total;
                winner = _players[i].playerAddress;
            }
        }

        // Transfer the pot to the winner
        require(winner != address(0), "No winner determined");
        payable(winner).transfer(pot);
        emit GameEnded(winner, pot);

        // Reset game state for next round
        delete _players;
        pot = 0;
        gameStarted = false;
    }
}

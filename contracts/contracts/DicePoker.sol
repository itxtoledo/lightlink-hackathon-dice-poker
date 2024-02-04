// SPDX-License-Identifier: MIT
// Developed by:
// - Jether Rodrigues
// - Gustavo Toledo
pragma solidity 0.8.20;

import "@api3/airnode-protocol/contracts/rrp/requesters/RrpRequesterV0.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DicePoker is Ownable, RrpRequesterV0 {
    struct Player {
        address playerAddress;
        uint256 currentBet;
        uint256[] diceValues;
    }

    Player[] private _players;
    uint256 public betAmount;
    uint256 public pot;
    bool public gameStarted;
    uint256 public constant MAX_DICE_ON_GAME = 5;
    uint256 public constant MAX_VALUE_ON_DICE = 6;
    mapping(bytes32 => address) public requestByUsers;

    // Event declarations
    event GameStarted();
    event PlayerJoined(address player);
    event DiceRolled(address player, uint256[] diceValues);
    event GameEnded(address winner, uint256 winnings);

    // ##region - Start QRNG configuration
    event RequestedUint256Array(bytes32 indexed requestId, uint256 size);
    event ReceivedUint256Array(bytes32 indexed requestId, uint256[] response);
    event WithdrawalRequested(
        address indexed airnode,
        address indexed sponsorWallet
    );

    address public airnode; // The address of the QRNG Airnode
    bytes32 public endpointIdUint256Array; // The endpoint ID for requesting an array of random numbers
    address public sponsorWallet; // The wallet that will cover the gas costs of the request
    uint256[] public _qrngUint256Array; // The array of random numbers returned by the QRNG Airnode

    mapping(bytes32 => bool) public expectingRequestWithIdToBeFulfilled;
    // ##region - End QRNG configuration

    // Constructor to initialize the contract
    constructor(uint256 _betAmount, address _airnodeRrp)
        Ownable(msg.sender)
        RrpRequesterV0(_airnodeRrp)
    {
        betAmount = _betAmount;
        gameStarted = false;
    }

    function players() external view returns (uint256) {
        return _players.length;
    }

    // Function to join the game
    function joinGame() external payable {
        require(msg.value == betAmount, "Incorrect bet amount");
        require(!gameStarted, "Game already started");

        _players.push(
            Player({
                playerAddress: msg.sender,
                currentBet: msg.value,
                diceValues: new uint256[](0)
            })
        );

        pot += msg.value;
        emit PlayerJoined(msg.sender);
    }

    // Function to start the game, only Owner can call this function
    function startGame() external onlyOwner {
        require(_players.length > 1, "Not enough players");
        gameStarted = true;
        emit GameStarted();
    }

    // Function to roll dice
    function rollDice() external {
        require(gameStarted, "Game not started");

        // Make request for an array of random numbers
        makeRequestUint256Array(MAX_DICE_ON_GAME);
    }

    // Function to end the game and declare winner, only Owner can call this function
    function endGame() external onlyOwner {
        require(gameStarted, "Game not started");

        uint256 highestTotal = 0;
        address winner;

        // Iterate through each player to calculate total dice values
        for (uint256 i = 0; i < _players.length; i++) {
            uint256 total = 0;

            for (uint256 j = 0; j < _players[i].diceValues.length; j++) {
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

    function getPlayerDices(address player) external view returns (uint256[] memory results) {
        for (uint i = 0; i < _players.length; i++) {
            if (_players[i].playerAddress == player) {
                results =  _players[i].diceValues;
                break;
            }
        }
    }

    // QRNG functions and logic to get the random number and random array of numbers

    /// @notice Sets the parameters for making requests
    function setRequestParameters(
        address _airnode,
        bytes32 _endpointIdUint256Array,
        address _sponsorWallet
    ) external onlyOwner {
        airnode = _airnode;
        endpointIdUint256Array = _endpointIdUint256Array;
        sponsorWallet = _sponsorWallet;
    }

    /// @notice Requests a `uint256[]`
    /// @param size Size of the requested array
    function makeRequestUint256Array(uint256 size) internal {
        bytes32 requestId = airnodeRrp.makeFullRequest(
            airnode,
            endpointIdUint256Array,
            address(this), // This contract
            sponsorWallet,
            address(this), // This contract
            this.fulfillUint256Array.selector,
            // Using Airnode ABI to encode the parameters
            abi.encode(bytes32("1u"), bytes32("size"), size)
        );

        requestByUsers[requestId] = msg.sender;

        expectingRequestWithIdToBeFulfilled[requestId] = true;
        emit RequestedUint256Array(requestId, size);
    }

    /// @notice Called by the Airnode through the AirnodeRrp contract to fulfill the request
    function fulfillUint256Array(bytes32 requestId, bytes calldata data) external onlyAirnodeRrp {
        require(expectingRequestWithIdToBeFulfilled[requestId], "Request ID not known");
        expectingRequestWithIdToBeFulfilled[requestId] = false;
        uint256[] memory qrngUint256Array = abi.decode(data, (uint256[]));

        _qrngUint256Array = qrngUint256Array;

        // Fill dice results with module of random number on array
        uint256[] memory diceResults = new uint256[](MAX_DICE_ON_GAME);
        for (uint256 i = 0; i < diceResults.length; i++) {
            diceResults[i] = (_qrngUint256Array[i] % MAX_VALUE_ON_DICE);
        }

        // Start to add dice results to the player that made the move on roll dice
        for (uint256 i = 0; i < _players.length; i++) {
            if (requestByUsers[requestId] == _players[i].playerAddress) {
                _players[i].diceValues = diceResults;

                emit DiceRolled(_players[i].playerAddress, diceResults);
                break;
            }
        }

        delete requestByUsers[requestId];
        emit ReceivedUint256Array(requestId, _qrngUint256Array);
    }

    /// @notice To withdraw funds from the sponsor wallet to the contract.
    function withdraw() external onlyOwner {
        airnodeRrp.requestWithdrawal(airnode, sponsorWallet);
    }

    /// @notice To receive funds from the sponsor wallet and send them to the owner.
    receive() external payable {
        payable(owner()).transfer(msg.value);
        emit WithdrawalRequested(airnode, sponsorWallet);
    }
}

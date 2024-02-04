### Contract Process Configurations
1. Deploy for DicePoker contract and pass in the constructor:
    - `BetAmount`: WEI - `10000000000000` (0,00001 ETH) - 0.00001 - 10000000000000
    - `AirnodeRrpV0 Address`: `0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd` (Ligthlink Pegasus Testnet)

Owner Wallet: `0xcafe675145c63B2D3aF8032164Bd7Fb382EDc040`

Deploy Transacion: https://pegasus.lightlink.io/tx/0xa4b3f9b9f51fc4c7197cfac4ae6ee2933a6117fcb00d262bf9ec9f563b56bb8d

Contract Deployed (`sponsor`): https://pegasus.lightlink.io/address/0xd388B99E2d035a134cA2C7fd1009d32061FB74df

2. Create a SponsorWallet:
    - Get the contract address from the previous step (`0xd388B99E2d035a134cA2C7fd1009d32061FB74df`)
    - Execute the command:
    ```shell
        npx @api3/airnode-admin derive-sponsor-wallet-address \
            --airnode-address 0x6238772544f029ecaBfDED4300f13A3c4FE84E1D \
            --airnode-xpub xpub6CuDdF9zdWTRuGybJPuZUGnU4suZowMmgu15bjFZT2o6PUtk4Lo78KGJUGBobz3pPKRaN9sLxzj21CMe6StP3zUsd8tWEJPgZBesYBMY7Wo \
            --sponsor-address 0xd388B99E2d035a134cA2C7fd1009d32061FB74df
    ```
    - Get the SponsorWallet address generate after command executed (`0x1bf82bc75964FB35ACD388Fa4aE52C60b84278C6`)

3. Send fund to the generated SponsorWallet on the Ligthlink Pegasus Testnet (at leat 0.01 ETH)
    - Use the https://faucet.pegasus.lightlink.io and send the faucet to the `0xcafe675145c63B2D3aF8032164Bd7Fb382EDc040`

Sponsor Wallet: https://pegasus.lightlink.io/address/0x1bf82bc75964FB35ACD388Fa4aE52C60b84278C6

4. Set parameters in the sponsor contract
    - Airnode address: `0x6238772544f029ecaBfDED4300f13A3c4FE84E1D`
    - EndpointIdUint256Array: `0x9877ec98695c139310480b4323b9d474d48ec4595560348a2341218670f7fbc2`
    - SponsorWallet: `0x1bf82bc75964FB35ACD388Fa4aE52C60b84278C6`

5. Add sponsor contract on whitelist
    - https://docs.lightlink.io/lightlink-protocol/building-on-lightlink/enabling-enterprise-mode
    - https://extensions-stage.lightlink.io/whitelist-enterprise

Add Whitelist Transaction: https://pegasus.lightlink.io/tx/0x93a60ac929bcb3df718f6ed28538a42a235175a254b0c26c3ffae593bd448da5

6. The contract is ready to start the Dice Poker Game

### Dice Poker Game Rules
1. `JoinGame` - Players need to join the game
2. `StartGame` - The Owner of the contract start the game, then, is not allowed join the game until end the current game
3. `RollDice` - Rolling the dices is allowed the current game is active
4. `EndGame` - The Owner of the contract, in a rigth moment, can end the game, so, here, the winner will be discovered, and the rewards will be payed and in the end, all the values used in the finished game will be reseted

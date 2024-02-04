### Contract Process Configurations
1. Deploy for DicePoker contract and pass in the constructor:
    - `BetAmount`: WEI - `1000000000000000000` (0.001 ETH)
    - `AirnodeRrpV0 Address`: `0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd` (Ligthlink Pegasus Testnet)

Owner Wallet: `0xcafe675145c63B2D3aF8032164Bd7Fb382EDc040`

Deploy Transacion: https://pegasus.lightlink.io/tx/0xeb62004933461de1663e120a7d0a60a5dc730ac16de912b4355834396814a657

Contract Deployed (`sponsor`): https://pegasus.lightlink.io/address/0x6c6E28615Dc5DfaF3C6368dDf2652262C5F38eae

2. Create a SponsorWallet:
    - Get the contract address from the previous step (`0x6c6E28615Dc5DfaF3C6368dDf2652262C5F38eae`)
    - Execute the command:
    ```shell
        npx @api3/airnode-admin derive-sponsor-wallet-address \
            --airnode-address 0x6238772544f029ecaBfDED4300f13A3c4FE84E1D \
            --airnode-xpub xpub6CuDdF9zdWTRuGybJPuZUGnU4suZowMmgu15bjFZT2o6PUtk4Lo78KGJUGBobz3pPKRaN9sLxzj21CMe6StP3zUsd8tWEJPgZBesYBMY7Wo \
            --sponsor-address 0x6c6E28615Dc5DfaF3C6368dDf2652262C5F38eae
    ```
    - Get the SponsorWallet address generate after command executed (`0xd6E795feAF661f93cEe6686fF28F9b28B6156800`)

3. Send fund to the generated SponsorWallet on the Ligthlink Pegasus Testnet (at leat 0.01 ETH)
    - Use the https://faucet.pegasus.lightlink.io and send the faucet to the `0xcafe675145c63B2D3aF8032164Bd7Fb382EDc040`

Sponsor Wallet: https://pegasus.lightlink.io/address/0xd6E795feAF661f93cEe6686fF28F9b28B6156800

4. Set parameters in the sponsor contract
    - Airnode address: `0x6238772544f029ecaBfDED4300f13A3c4FE84E1D`
    - EndpointIdUint256Array: `0x9877ec98695c139310480b4323b9d474d48ec4595560348a2341218670f7fbc2`
    - SponsorWallet: `0xd6E795feAF661f93cEe6686fF28F9b28B6156800`

5. The contract is ready to start the Dice Poker Game

### Dice Poker Game Rules
1. `JoinGame` - Players need to join the game
2. `StartGame` - The Owner of the contract start the game, then, is not allowed join the game until end the current game
3. `RollDice` - Rolling the dices is allowed the current game is active
4. `EndGame` - The Owner of the contract, in a rigth moment, can end the game, so, here, the winner will be discovered, and the rewards will be payed and in the end, all the values used in the finished game will be reseted

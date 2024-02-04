import { defineChain } from "viem";

export const lightlink = defineChain({
  id: 1891,
  name: "Lightlink Pegasus Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://replicator.pegasus.lightlink.io/rpc/v1"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.zora.energy" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
});

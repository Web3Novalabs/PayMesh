import { defineConfig } from "apibara/config";
import { startingBlock } from "./helpers";

export default defineConfig({
  runtimeConfig: {
    paymeshStarknet: {
      startingBlock: "0",
      streamUrl: "https://mainnet.starknet.a5a.ch",
      contractAddress:
        "0x01710ab6e17d6809cd9d5e9b22e6bb1d1d09ca40f50449ea7ac81d67bef80f31",
    },
    crowdfunding: {
      startingBlock: "0",
      streamUrl: "https://mainnet.starknet.a5a.ch",
      contractAddress:
        "0x03e58267891dff9318e6e715336b84b515547173dee464d251d0aae3ed19e22a",
    },
    // crowdfunding: {
    //   startingBlock: 0,
    //   streamUrl: "https://mainnet.starknet.a5a.ch",
    // },
  },
});

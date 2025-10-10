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
        "0x05371e167ec1a1884734895bd25aa66765829d1b040f66fc757d1f4ce13aa401",
    },
    // crowdfunding: {
    //   startingBlock: 0,
    //   streamUrl: "https://mainnet.starknet.a5a.ch",
    // },
  },
});

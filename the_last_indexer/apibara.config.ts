import { defineConfig } from "apibara/config";

export default defineConfig({
  runtimeConfig: {
    paymeshStarknet: {
      startingBlock: 2058843,
      streamUrl: "https://mainnet.starknet.a5a.ch",
      contractAddress: "0x01710ab6e17d6809cd9d5e9b22e6bb1d1d09ca40f50449ea7ac81d67bef80f31",
    },
  },
});
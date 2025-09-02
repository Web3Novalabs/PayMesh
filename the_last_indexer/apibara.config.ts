import { defineConfig } from "apibara/config";

export default defineConfig({
  runtimeConfig: {
    paymeshStarknet: {
      startingBlock: 1843298,
      streamUrl: "https://sepolia.starknet.a5a.ch",
      contractAddress:
        "",
    },
  },
});
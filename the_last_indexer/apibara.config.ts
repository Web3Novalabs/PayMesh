import { defineConfig } from "apibara/config";

export default defineConfig({
  runtimeConfig: {
    paymeshStarknet: {
      startingBlock: "0",
      streamUrl: "https://mainnet.starknet.a5a.ch",
      contractAddress:
        "0x01710ab6e17d6809cd9d5e9b22e6bb1d1d09ca40f50449ea7ac81d67bef80f31",
        // "0x01be0fc9d374adc3b63dc87032d5828ed0a73ac0b773d5d611287739e0259d00", // mainnet testing contract
    },
    crowdfunding: {
      startingBlock: "0",
      streamUrl: "https://mainnet.starknet.a5a.ch",
      contractAddress:
        "0x02c92666029b207dc882c267d7b55c3fe4178e9f550f7188cd49adb85f963623",
    },
  },
});

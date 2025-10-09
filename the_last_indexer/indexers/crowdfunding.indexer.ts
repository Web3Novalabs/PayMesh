import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";

import { FieldElement, StarknetStream, decodeEvent, getSelector } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS, TRANSFER_SELECTOR, USDC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS, WBTC_TOKEN_ADDRESS } from "../constants";
import { crowdfunding_abi } from "crowdfunding_abi";
import { strk_abi } from "strk_abi";
import { startingBlock } from "../helpers";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock: _, streamUrl, contractAddress } = (runtimeConfig as any)["crowdfunding"];
  
  const POOL_CREATED_SELECTOR = getSelector("PoolCreated");
  const POOL_PAID_SELECTOR = getSelector("PoolPaid");
  
  let crowd_funding_cache = ["0x03aa185407204fd73573747f9642fef9fc438980667dc8ae307835bb4d300cf0"];
  console.log("Crowd Funding Cache: ", crowd_funding_cache);

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: contractAddress as FieldElement,
          keys: [],
        },
        {
          address: STRK_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR]
        },
        {
          address: ETH_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR]
        },
        {
          address: USDT_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR]
        },
        {
          address: USDC_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR]
        },
        {
          address: WBTC_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR]
        },
      ],
    },
    plugins: [],
    async transform({ block }) {
      const logger = useLogger();
      const { events: blockEvents, header } = block;
      logger.info(`Received mainnet block ${header.blockNumber}`);

      for (const event of blockEvents) {
        const eventKey = event.keys[0];

        if (eventKey === TRANSFER_SELECTOR) {
          const { args } = decodeEvent({ strict: true, event, abi: strk_abi, eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer" });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          if (crowd_funding_cache.includes(args.to)) {
            logger.info(`\n💡 Transfer event ${safeArgs}`);
          }

        } else if (eventKey === POOL_CREATED_SELECTOR) {
          logger.info("Pool Created");
          const { args } = decodeEvent({ strict: true, event, abi: crowdfunding_abi, eventName: "contract::base::events::PoolCreated" });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          logger.info(`\n💡 Pool created event ${safeArgs}`);

          // add the pool address to the cache
          crowd_funding_cache.push(args.pool_address);
          console.log("Crowd Funding Cache: ", crowd_funding_cache);
        }
        else if (eventKey === POOL_PAID_SELECTOR) {
          logger.info("Pool Paid");
          const { args } = decodeEvent({ strict: true, event, abi: crowdfunding_abi, eventName: "contract::base::events::PoolPaid" });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          logger.info(`\n💡 Pool paid event ${safeArgs}`);
        }
      }
    },
  });
}

// // function to get all crowd funding contract addresses
// export const crowdFundingContractAddresses = await fetch(
//   `${process.env.API_URL}/all_crowd_funding_contract_addresses`,
//   {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   },
// )
//   .then((response) => response.json())
//   .then((data: any) => data);
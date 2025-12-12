import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";

import {
  FieldElement,
  StarknetStream,
  decodeEvent,
} from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  TRANSFER_SELECTOR,
  USDC_TOKEN_ADDRESS,
  USDT_TOKEN_ADDRESS,
  WBTC_TOKEN_ADDRESS,
  GROUP_ADDRESS,
  CROWDFUNDING_ADDRESS,
  POOL_CREATED_SELECTOR,
  POOL_PAID_SELECTOR,
  GROUP_CREATED_SELECTOR,
  SUBSCRIPTION_TOPPED_SELECTOR,
  GROUP_PAID_SELECTOR
} from "../constants";

import { crowdfunding_abi } from "crowdfunding_abi";
import { myAbi } from "../abi";
import { strk_abi } from "strk_abi";
import { hexToString, startingBlock } from "../helpers";
import { crowdFundingContractAddresses, group_address_cache } from "crowd_funding_functions";

export default function (runtimeConfig: ApibaraRuntimeConfig) {

  let crowd_funding_cache = [...crowdFundingContractAddresses];
  let group_cache = [...group_address_cache];
 
  return defineIndexer(StarknetStream)({
    streamUrl: "https://mainnet.starknet.a5a.ch",
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    debug: true,
    filter: {
      events: [
        {
          address: CROWDFUNDING_ADDRESS as FieldElement
        },
        {
          address: GROUP_ADDRESS as FieldElement
        },
        {
          address: STRK_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR],
        },
        {
          address: ETH_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR],
        },
        {
          address: USDT_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR],
        },
        {
          address: USDC_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR],
        },
        {
          address: WBTC_TOKEN_ADDRESS,
          keys: [TRANSFER_SELECTOR],
        },
      ],
    },
    async transform({ block }) {
      const logger = useLogger();
      const { events: blockEvents } = block;

      logger.info(`\n V3 indexer has started`);
      logger.info(`\n Starting form block ${startingBlock}`);

      for (const event of blockEvents) {
        const eventKey = event.keys[0];

        switch (eventKey) {
          case POOL_CREATED_SELECTOR: {
            const { args } = decodeEvent({
              strict: true,
              event,
              abi: crowdfunding_abi,
              eventName: "contract::base::events::PoolPaid",
            });
            const safeArgs = JSON.stringify(args, (_, v) =>
              typeof v === "bigint" ? v.toString() : v
            );
            const { pool_address, amount, paid_by, _, token_address } = JSON.parse(safeArgs);
            logger.info(`\n  Pool paid event ${pool_address}`); 
            break;
          }
          case TRANSFER_SELECTOR: {
            const { args } = decodeEvent({
              strict: true,
              event,
              abi: strk_abi,
              eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer",
            });
            const safeArgs = JSON.stringify(args, (_, v) =>
              typeof v === "bigint" ? v.toString() : v
            );
            if (crowd_funding_cache.includes(args.to)) {
              const { from, to, value } = JSON.parse(safeArgs);
              logger.info(`\n  Transfer event to crowdfunding ${to}`);
            }
            break;
          }  
          default:
            logger.info(`\n  Unhandled event with key`);
        }
        // if (eventKey === POOL_CREATED_SELECTOR) {
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: crowdfunding_abi,
        //     eventName: "contract::base::events::PoolCreated",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );
        //   const { pool_address, _, creator, pool_name, target_amount } =
        //     JSON.parse(safeArgs);
        //   crowd_funding_cache.push(args.pool_address);
        //   create_crowd_funding(pool_address, creator, hexToString(pool_name), target_amount);
        //   logger.info(`\n  Crowdfunding created event ${pool_address}`);
        // } else if (eventKey === POOL_PAID_SELECTOR) {
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: crowdfunding_abi,
        //     eventName: "contract::base::events::PoolPaid",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );
        //   const { pool_address, amount, paid_by, _, token_address } =
        //     JSON.parse(safeArgs);
        //   resolve_crowd_funding(
        //     pool_address,
        //     amount,
        //     token_address,
        //     event.transactionHash,
        //     paid_by
        //   );
        //   logger.info(`\n  Pool paid event ${pool_address}`);
        // }
        // // Group Events
        // else if (eventKey === GROUP_CREATED_SELECTOR) {
        //   logger.info(`\n  Group created event`);
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: myAbi,
        //     eventName: "contract::base::events::GroupCreated",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );
        //   const { group_address, _, creator, name, usage_count, members } =
        //     JSON.parse(safeArgs);

        //   if (!group_cache.includes(group_address)) {
        //     group_cache.push(group_address);
        //   }

        //   create_group(
        //     group_address,
        //     creator,
        //     hexToString(name),
        //     usage_count,
        //     members
        //   );
        // } else if (eventKey === GROUP_PAID_SELECTOR) {
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: myAbi,
        //     eventName: "contract::base::events::GroupPaid",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );
        //   const {
        //     group_address,
        //     amount,
        //     paid_by,
        //     paid_at,
        //     members,
        //     usage_count,
        //     token_address,
        //   } = JSON.parse(safeArgs);
        //   logger.info(`\n  Group paid event ${group_address}`);
        //   let tx_hash = event.transactionHash;
        //   store_distribution_history(
        //     group_address,
        //     token_address,
        //     tx_hash,
        //     usage_count,
        //     amount,
        //     members
        //   );
        // } else if (eventKey === SUBSCRIPTION_TOPPED_SELECTOR) {
        //   logger.info(`\n  Group top up subscribed`);
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: myAbi,
        //     eventName: "contract::base::events::SubscriptionTopped",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );
        //   const { group_address, usage_count } = JSON.parse(safeArgs);
        //   subsciption_topped(group_address, Number(usage_count));
        // }
        // // Transfer Event - handled for both crowdfunding and groups
        // else if (eventKey === TRANSFER_SELECTOR) {
        //   const { args } = decodeEvent({
        //     strict: true,
        //     event,
        //     abi: strk_abi,
        //     eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer",
        //   });
        //   const safeArgs = JSON.stringify(args, (_, v) =>
        //     typeof v === "bigint" ? v.toString() : v
        //   );

        //   // Check if transfer is to crowdfunding pool
        //   if (crowd_funding_cache.includes(args.to)) {
        //     const { from, to, value } = JSON.parse(safeArgs);
        //     donate_to_crowd_funding(
        //       to,
        //       value,
        //       from,
        //       event.address,
        //       event.transactionHash
        //     );
        //     logger.info(`\n  Transfer event to crowdfunding ${to}`);
        //   }
        //   // Check if transfer is to group
        //   else if (group_cache.includes(args.to)) {
        //     let tx_hash = event.transactionHash;
        //     pay(args.to, args.from, tx_hash, String(args.value), event.address);
        //     logger.info(`\n  Transfer event to group ${args.to}`);
        //   }
        // }
      }
    },
  });
}

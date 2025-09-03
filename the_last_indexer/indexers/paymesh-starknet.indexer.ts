import { defineIndexer } from "apibara/indexer";
import { logger, useLogger } from "apibara/plugins";

import { StarknetStream, getSelector, FieldElement, decodeEvent } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { myAbi } from "../abi";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl } = runtimeConfig["paymeshStarknet"];
  const config = runtimeConfig.paymeshStarknet;

  const TRANSFER_SELECTOR = getSelector("Transfer");
  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt("1862800"),
    filter: {
      events: [
        {
          address: "0x05104372b1060b8efb78788ad23a702a347869044485b336d6ad15afa2632f15",
          keys: [GROUP_CREATED_SELECTOR],
        },
        {
          address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          keys: [TRANSFER_SELECTOR]
        },
      ],
    },
    plugins: [],
    async transform({ block }) {
      const logger = useLogger();
      const { events: blockEvents, header } = block;
      logger.info(`Processing block ${header.blockNumber}`);

      for (const event of blockEvents) {
        const eventKey = event.keys[0];
        
        if (eventKey === GROUP_CREATED_SELECTOR) {

          const { args } = decodeEvent({ strict: true, event, abi: myAbi, eventName: "contract::base::events::GroupCreated" });
          
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          logger.info(`\n💡 Group created event`);

          const {group_address, _, creator, name, usage_count, members} = JSON.parse(safeArgs);
                    
          create_group(group_address, creator, name, usage_count, members);
        } 
        else if (eventKey === TRANSFER_SELECTOR) {
        }
      }
    },
  });
}

const pay = (address: string, tx_hash: string) => {
  console.log(`Processing payment for: ${address}, tx: ${tx_hash}`);
  fetch("http://localhost:8080/pay_group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "group_address": address,
      "txn": tx_hash
    }),
  }).catch((err) => {
    console.error(`Payment error for ${address}:`, err);
  });
};

const create_group = (address: string, creatorAddress: string, groupName: string, usageCount: number, members: Array<{ addr: string; percentage: number; }>) => {
  console.log("Creating group");
  fetch("http://localhost:8080/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    "group_address": address,
    "group_name": groupName,
    "created_by": creatorAddress,
    "usage_remaining": usageCount,
    "members": [
        ...members
    ]
}),
//     body: JSON.stringify({
//     "group_address": address,
//     "group_name": groupName,
//     "created_by": creatorAddress,
//     "usage_remaining": usageCount,
//     "members": [
//         ...members
//     ]
// }),
  }).catch((err) => {
    console.error(`Create group error ${address}:`, err);
  });
};
// const create_group = (address: string) => {
//   console.log("Creating group:", address);
//   fetch("http://localhost:8080/health", {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//     // body: JSON.stringify(address),
//   }).catch((err) => {
//     console.error(`Create group error ${address}:`, err);
//   });
// };


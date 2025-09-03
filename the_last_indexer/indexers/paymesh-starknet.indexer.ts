import { defineIndexer } from "apibara/indexer";
import { logger, useLogger } from "apibara/plugins";

import { StarknetStream, getSelector, FieldElement, decodeEvent } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { myAbi } from "../abi";
import { strk_abi } from "../strk_abi";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl } = runtimeConfig["paymeshStarknet"];
  const config = runtimeConfig.paymeshStarknet;

  const TRANSFER_SELECTOR = getSelector("Transfer");
  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt("1866196"),
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
          const { args } = decodeEvent({ strict: true, event, abi: strk_abi, eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer" });

          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          let tx_hash = event.transactionHash;

          let token_address = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

          pay(args.to, args.from, tx_hash, String(args.value), token_address);
        }
      }
    },
  });
}

const pay = (address: string, from_address: string, tx_hash: string, amount: string, token_address: string) => {
  
  let body = JSON.stringify({
      "group_address": address,
      "from_address": from_address,
      "tx_hash": tx_hash,
      "token_amount": amount,
      "token_address": token_address
    });

  fetch("http://localhost:8080/pay_group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
  }).catch((err) => {
    console.error(`Payment error for ${address}:`, err);
  });
};

const create_group = (address: string, creatorAddress: string, groupName: string, usageCount: number, members: Array<{ addr: string; percentage: number; }>) => {
  let members_decoupled = members.map(member => ({
    addr: member.addr,
    percentage: Number(member.percentage)
  }));
  let body = JSON.stringify({
    "group_address": address,
    "group_name": groupName,
    "created_by": creatorAddress,
    "usage_remaining": Number(usageCount),
    "members": [
        ...members_decoupled
      ]
    })
  fetch("http://localhost:8080/group", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body, 
  }).catch((err) => {
    console.error(`Create group error ${address}:`, err);
  });
};

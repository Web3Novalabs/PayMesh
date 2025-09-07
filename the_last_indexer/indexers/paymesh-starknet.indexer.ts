import { defineIndexer } from "apibara/indexer";
import { logger, useLogger } from "apibara/plugins";

import { StarknetStream, getSelector, FieldElement, decodeEvent } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { myAbi } from "../abi";
import { strk_abi } from "../strk_abi";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl, contractAddress } = runtimeConfig["paymeshStarknet"];
  const config = runtimeConfig.paymeshStarknet;

  const TRANSFER_SELECTOR = getSelector("Transfer");
  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");
  const SUBSCRIPTION_TOPPED_SELECTOR = getSelector("SubscriptionTopped");
  const GROUP_PAID_SELECTOR = getSelector("GroupPaid");
  const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  const ETH_TOKEN_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  const USDT_TOKEN_ADDRESS = "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8";
  const USDC_TOKEN_ADDRESS = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: "0x01710ab6e17d6809cd9d5e9b22e6bb1d1d09ca40f50449ea7ac81d67bef80f31",  //contractAddress as FieldElement,
          keys: [],  // , GROUP_PAID_SELECTOR, SUBSCRIPTION_TOPPED_SELECTOR
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

          pay(args.to, args.from, tx_hash, String(args.value), event.address);
        }
        else if (eventKey === GROUP_PAID_SELECTOR) {
          const { args } = decodeEvent({ strict: true, event, abi: myAbi, eventName: "contract::base::events::GroupPaid" });
          
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          const {group_address, amount, paid_by, paid_at, members, usage_count, token_address} = JSON.parse(safeArgs);

          let tx_hash = event.transactionHash;

          store_distribution_history(group_address, token_address, tx_hash, usage_count, amount, members);
        }
      }
    },
  });
}

const store_distribution_history = (group_address: string, token_address: string, tx_hash: string, usage_remaining: number, 
  token_amount: string, members: Array<{ addr: string; share: string; }>) => {
  console.log(`member array is:`, members);
  let members_decoupled = members.map(member => ({
    member_address: member.addr,
    member_amount: member.share
  }));
  console.log("Members decoupled:", members_decoupled);
  let body = JSON.stringify({
      "group_address": group_address,
      "token_address": token_address,
      "tx_hash": tx_hash,
      "usage_remaining": Number(usage_remaining),
      "token_amount": token_amount,
      "members": [
          ...members_decoupled
        ]
    });
    console.log("Storing distribution history:", body);
  fetch("http://localhost:8080/store_payment_distribution_history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
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

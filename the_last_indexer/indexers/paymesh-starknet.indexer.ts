import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";

import { StarknetStream, getSelector, FieldElement, decodeEvent } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { myAbi } from "../abi";
import { strk_abi } from "../strk_abi";
import { 
  STRK_TOKEN_ADDRESS, 
  ETH_TOKEN_ADDRESS, 
  USDT_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS, 
  WBTC_TOKEN_ADDRESS, 
  TRANSFER_SELECTOR
} from "../constants";
import { hexToString, startingBlock } from "../helpers";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock: _, streamUrl, contractAddress } = runtimeConfig["paymeshStarknet"];

  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");
  const SUBSCRIPTION_TOPPED_SELECTOR = getSelector("SubscriptionTopped");
  const GROUP_PAID_SELECTOR = getSelector("GroupPaid");

  
  const groupCache: string[] = [...group_address_cache];
  console.log(` the group cache is ${groupCache}`);

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
        
        if (eventKey === GROUP_CREATED_SELECTOR) {
          logger.info(`\n💡 Group created event`); 
          const { args } = decodeEvent({ strict: true, event, abi: myAbi, eventName: "contract::base::events::GroupCreated" });
          
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
        );
        
        const {group_address, _, creator, name, usage_count, members} = JSON.parse(safeArgs);

        if (!groupCache.includes(group_address)) {
          groupCache.push(group_address);
          console.log(`✅ Added group ${group_address} to cache`);
        }
        
          create_group(group_address, creator, hexToString(name), usage_count, members);
        } 
        else if (eventKey === TRANSFER_SELECTOR) {

          const { args } = decodeEvent({ strict: true, event, abi: strk_abi, eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer" });

          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          let tx_hash = event.transactionHash;

          if (groupCache.includes(args.to)) {
            console.log(`💰 Transfer to group ${args.to}, processing payment...`);
            pay(args.to, args.from, tx_hash, String(args.value), event.address);
          }         
        }
        else if (eventKey === GROUP_PAID_SELECTOR) {
          
          logger.info("Group Paid Occurred")

          const { args } = decodeEvent({ strict: true, event, abi: myAbi, eventName: "contract::base::events::GroupPaid" });
          
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          const {group_address, amount, paid_by, paid_at, members, usage_count, token_address} = JSON.parse(safeArgs);

          logger.info(`\n💡 Group paid event ${group_address}`);

          let tx_hash = event.transactionHash;

          store_distribution_history(group_address, token_address, tx_hash, usage_count, amount, members);
        }
        else if (eventKey === SUBSCRIPTION_TOPPED_SELECTOR) {

          logger.info(`\n💡 Group top up subsribed`);

          const { args } = decodeEvent({ strict: true, event, abi: myAbi, eventName: "contract::base::events::SubscriptionTopped" });

          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          const {group_address, usage_count} = JSON.parse(safeArgs);


          subsciption_topped(group_address, Number(usage_count));
        }
      }
    },
  });
}

const store_distribution_history = (
  group_address: string,
  token_address: string,
  tx_hash: string,
  usage_remaining: number,
  token_amount: string,
  members: Array<{ addr: string; share: string; }>
) => {
  const members_decoupled = members.map(member => ({
    member_address: member.addr,
    member_amount: member.share
  }));

  fetch(`${process.env.API_URL}/groups/${group_address}/payment-distributions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`
    },
    body: JSON.stringify({
      members: members_decoupled,
      token_address: token_address,
      token_amount: token_amount,
      tx_hash: tx_hash,
      usage_remaining: Number(usage_remaining)
    })
  });
}

const pay = (
  group_address: string,
  from_address: string,
  tx_hash: string,
  token_amount: string,
  token_address: string
) => {
  const body = JSON.stringify({
    from_address,
    token_address,
    token_amount,
    tx_hash
  });

  console.log(`payment data ${body}`);
  fetch(`${process.env.API_URL}/groups/${group_address}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`
    },
    body: body
  })
  .catch((err) => {
    console.error(`Payment error for ${group_address}:`, err);
  });
};

const subsciption_topped = (group_address: string, usage_count: number) => {
  const body = JSON.stringify({
    usage_count: usage_count
  });
  console.log(`subscription topped data ${body}`);

  fetch(`${process.env.API_URL}/groups/${group_address}/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`
    },
    body: body
  }).catch((err) => {
    console.error(`Subscription top up error for ${group_address}:`, err);
  });
};

const create_group = (
  address: string,
  creatorAddress: string,
  groupName: string,
  usageCount: number,
  members: Array<{ addr: string; percentage: number; }>
) => {
  const body = JSON.stringify({
    created_by: creatorAddress,
    group_address: address,
    group_name: groupName,
    members: members.map(member => ({
      addr: member.addr,
      percentage: Number(member.percentage)
    })),
    usage_remaining: Number(usageCount)
  });

  fetch(`${process.env.API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'paymesh-api-key': `${process.env.PAYMESH_API_KEY}`
    },
    body: body
  }).catch((err) => {
    console.error(`Create group error ${address}:`, err);
  });
};

export const group_address_cache = await fetch(
  `${process.env.API_URL}/groups/addresses`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  },
)
  .then((response) => response.json())
  .then((data: any) => data);



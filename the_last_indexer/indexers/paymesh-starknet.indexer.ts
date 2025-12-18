import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";

import {
  FieldElement,
  StarknetStream,
  decodeEvent,
  getSelector,
} from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import {
  ETH_TOKEN_ADDRESS,
  STRK_TOKEN_ADDRESS,
  TRANSFER_SELECTOR,
  USDC_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS_2,
  USDT_TOKEN_ADDRESS,
  WBTC_TOKEN_ADDRESS,
} from "../constants";
import { crowdfunding_abi } from "crowdfunding_abi";
import { myAbi } from "../abi";
import { strk_abi } from "strk_abi";
import { hexToString, startingBlock } from "../helpers";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const crowdfundingConfig = (runtimeConfig as any)["crowdfunding"];
  const groupConfig = runtimeConfig["paymeshStarknet"];

  const POOL_CREATED_SELECTOR = getSelector("PoolCreated");
  const POOL_PAID_SELECTOR = getSelector("PoolPaid");
  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");
  const SUBSCRIPTION_TOPPED_SELECTOR = getSelector("SubscriptionTopped");
  const GROUP_PAID_SELECTOR = getSelector("GroupPaid");

  let crowd_funding_cache = [...crowdFundingContractAddresses];
  let group_cache = [...group_address_cache];

  console.log("Crowd Funding Cache: ", crowd_funding_cache);
  console.log("Group Cache: ", group_cache);
  console.log("starting block ", startingBlock)

  return defineIndexer(StarknetStream)({
    streamUrl: crowdfundingConfig.streamUrl || groupConfig.streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: crowdfundingConfig.contractAddress as FieldElement,
          keys: [],
        },
        {
          address: groupConfig.contractAddress as FieldElement,
          keys: [],
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
        {
          address: USDC_TOKEN_ADDRESS_2,
          keys: [TRANSFER_SELECTOR],
        },
      ],
    },
    plugins: [],
    async transform({ block }) {
      const logger = useLogger();
      const { events: blockEvents } = block;

      for (const event of blockEvents) {
        const eventKey = event.keys[0];

        // Crowdfunding Events
        if (eventKey === POOL_CREATED_SELECTOR) {
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: crowdfunding_abi,
            eventName: "contract::base::events::PoolCreated",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          const { pool_address, _, creator, pool_name, target_amount } =
            JSON.parse(safeArgs);
          crowd_funding_cache.push(args.pool_address);
          // create_crowd_funding(pool_address, creator, hexToString(pool_name), target_amount);
          logger.info(`\n💡 Crowdfunding created event ${pool_address}`);
        } else if (eventKey === POOL_PAID_SELECTOR) {
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: crowdfunding_abi,
            eventName: "contract::base::events::PoolPaid",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          const { pool_address, amount, paid_by, _, token_address } =
            JSON.parse(safeArgs);
          resolve_crowd_funding(
            pool_address,
            amount,
            token_address,
            event.transactionHash,
            paid_by
          );
          logger.info(`\n💡 Pool paid event ${pool_address}`);
        }
        // Group Events
        else if (eventKey === GROUP_CREATED_SELECTOR) {
          logger.info(`\n💡 Group created event`);
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: myAbi,
            eventName: "contract::base::events::GroupCreated",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          const { group_address, _, creator, name, usage_count, members } =
            JSON.parse(safeArgs);

          if (!group_cache.includes(group_address)) {
            group_cache.push(group_address);
            console.log(`✅ Added group ${group_address} to cache`);
          }

          create_group(
            group_address,
            creator,
            hexToString(name),
            usage_count,
            members
          );
        } else if (eventKey === GROUP_PAID_SELECTOR) {
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: myAbi,
            eventName: "contract::base::events::GroupPaid",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          const {
            group_address,
            amount,
            paid_by,
            paid_at,
            members,
            usage_count,
            token_address,
          } = JSON.parse(safeArgs);
          logger.info(`\n💡 Group paid event ${group_address}`);
          let tx_hash = event.transactionHash;
          store_distribution_history(
            group_address,
            token_address,
            tx_hash,
            usage_count,
            amount,
            members
          );
        } else if (eventKey === SUBSCRIPTION_TOPPED_SELECTOR) {
          logger.info(`\n💡 Group top up subscribed`);
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: myAbi,
            eventName: "contract::base::events::SubscriptionTopped",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );
          const { group_address, usage_count } = JSON.parse(safeArgs);
          subsciption_topped(group_address, Number(usage_count));
        }
        // Transfer Event - handled for both crowdfunding and groups
        else if (eventKey === TRANSFER_SELECTOR) {
          const { args } = decodeEvent({
            strict: true,
            event,
            abi: strk_abi,
            eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer",
          });
          const safeArgs = JSON.stringify(args, (_, v) =>
            typeof v === "bigint" ? v.toString() : v
          );

          // Check if transfer is to crowdfunding pool
          if (crowd_funding_cache.includes(args.to)) {
            const { from, to, value } = JSON.parse(safeArgs);
            if (event.address === USDC_TOKEN_ADDRESS_2) {
              donate_to_crowd_funding(
                to,
                value,
                from,
                USDC_TOKEN_ADDRESS,
                event.transactionHash
              );
            } else {
              donate_to_crowd_funding(
                to,
                value,
                from,
                event.address,
                event.transactionHash
              );
            }
            logger.info(`\n💡 Transfer event to crowdfunding ${to}`);
          }
          // Check if transfer is to group
          else if (group_cache.includes(args.to)) {
            console.log(
              `💰 Transfer to group ${args.to}, processing payment...`
            );
            let tx_hash = event.transactionHash;
            pay(args.to, args.from, tx_hash, String(args.value), event.address);
          }
        }
      }
    },
  });
}

// Cache exports
export const crowdFundingContractAddresses = await fetch(
  `${process.env.API_URL}/crowdfunding/addresses`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }
)
  .then((response) => response.json())
  .then((data: any) => data);

export const group_address_cache = await fetch(
  `${process.env.API_URL}/groups/addresses`,
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }
)
  .then((response) => response.json())
  .then((data: any) => data);

// Crowdfunding Functions
const create_crowd_funding = (
  pool_address: string,
  creator_address: string,
  name: string,
  target_amount: string
) => {
  fetch(`${process.env.API_URL}/crowdfunding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: JSON.stringify({
      creator_address: creator_address,
      name: name,
      pool_address: pool_address,
      target_amount: target_amount,
    }),
  });
  console.log("Crowd funding created: ", pool_address);
};

const donate_to_crowd_funding = (
  crowd_funding_address: string,
  amount: string,
  donor_address: string,
  token_address: string,
  transaction_hash: string
) => {
  fetch(`${process.env.API_URL}/crowdfunding/${crowd_funding_address}/donate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: JSON.stringify({
      amount: amount,
      donor_address: donor_address,
      token_address: token_address,
      transaction_hash: transaction_hash,
    }),
  });
};

const resolve_crowd_funding = (
  crowd_funding_address: string,
  amount: string,
  token_address: string,
  transaction_hash: string,
  withdrawn_by: string
) => {
  fetch(
    `${process.env.API_URL}/crowdfunding/${crowd_funding_address}/resolve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
      },
      body: JSON.stringify({
        amount: amount,
        token_address: token_address,
        transaction_hash: transaction_hash,
        withdrawn_by: withdrawn_by,
      }),
    }
  );
};

// Group Functions
const create_group = (
  address: string,
  creatorAddress: string,
  groupName: string,
  usageCount: number,
  members: Array<{ addr: string; percentage: number }>
) => {
  const body = JSON.stringify({
    created_by: creatorAddress,
    group_address: address,
    group_name: groupName,
    members: members.map((member) => ({
      addr: member.addr,
      percentage: Number(member.percentage),
    })),
    usage_remaining: Number(usageCount),
  });

  fetch(`${process.env.API_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Create group error ${address}:`, err);
  });
};

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
    tx_hash,
  });

  console.log(`payment data ${body}`);
  fetch(`${process.env.API_URL}/groups/${group_address}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Payment error for ${group_address}:`, err);
  });
};

const store_distribution_history = (
  group_address: string,
  token_address: string,
  tx_hash: string,
  usage_remaining: number,
  token_amount: string,
  members: Array<{ addr: string; share: string }>
) => {
  const members_decoupled = members.map((member) => ({
    member_address: member.addr,
    member_amount: member.share,
  }));

  fetch(
    `${process.env.API_URL}/groups/${group_address}/payment-distributions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
      },
      body: JSON.stringify({
        members: members_decoupled,
        token_address: token_address,
        token_amount: token_amount,
        tx_hash: tx_hash,
        usage_remaining: Number(usage_remaining),
      }),
    }
  );
};

const subsciption_topped = (group_address: string, usage_count: number) => {
  const body = JSON.stringify({
    usage_count: usage_count,
  });
  console.log(`subscription topped data ${body}`);

  fetch(`${process.env.API_URL}/groups/${group_address}/subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "paymesh-api-key": `${process.env.PAYMESH_API_KEY}`,
    },
    body: body,
  }).catch((err) => {
    console.error(`Subscription top up error for ${group_address}:`, err);
  });
};
// import { defineIndexer } from "apibara/indexer";
// import { useLogger } from "apibara/plugins";

// import { FieldElement, StarknetStream, decodeEvent, getSelector } from "@apibara/starknet";
// import type { ApibaraRuntimeConfig } from "apibara/types";
// import { ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS, TRANSFER_SELECTOR, USDC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS, WBTC_TOKEN_ADDRESS } from "../constants";
// import { crowdfunding_abi } from "crowdfunding_abi";
// import { strk_abi } from "strk_abi";
// import { hexToString, startingBlock } from "../helpers";

// export default function (runtimeConfig: ApibaraRuntimeConfig) {
//   const { startingBlock: _, streamUrl, contractAddress } = (runtimeConfig as any)["crowdfunding"];
  
//   const POOL_CREATED_SELECTOR = getSelector("PoolCreated");
//   const POOL_PAID_SELECTOR = getSelector("PoolPaid");
  
//   let crowd_funding_cache = [...crowdFundingContractAddresses];
//   console.log("Crowd Funding Cache: ", crowd_funding_cache);

//   return defineIndexer(StarknetStream)({
//     streamUrl,
//     finality: "accepted",
//     startingBlock: BigInt(startingBlock),
//     filter: {
//       events: [
//         {
//           address: contractAddress as FieldElement,
//           keys: [],
//         },
//         {
//           address: STRK_TOKEN_ADDRESS,
//           keys: [TRANSFER_SELECTOR]
//         },
//         {
//           address: ETH_TOKEN_ADDRESS,
//           keys: [TRANSFER_SELECTOR]
//         },
//         {
//           address: USDT_TOKEN_ADDRESS,
//           keys: [TRANSFER_SELECTOR]
//         },
//         {
//           address: USDC_TOKEN_ADDRESS,
//           keys: [TRANSFER_SELECTOR]
//         },
//         {
//           address: WBTC_TOKEN_ADDRESS,
//           keys: [TRANSFER_SELECTOR]
//         },
//       ],
//     },
//     plugins: [],
//     async transform({ block }) {
//       const logger = useLogger();
//       const { events: blockEvents, header } = block;
//       logger.info(`Received mainnet block ${header.blockNumber}`);

//       for (const event of blockEvents) {
//         const eventKey = event.keys[0];

//         if (eventKey === TRANSFER_SELECTOR) {
//           const { args } = decodeEvent({ strict: true, event, abi: strk_abi, eventName: "src::strk::erc20_lockable::ERC20Lockable::Transfer" });
//           const safeArgs = JSON.stringify(args, (_, v) =>
//             typeof v === "bigint" ? v.toString() : v
//           );
//           if (crowd_funding_cache.includes(args.to)) {
//             const {from, to, value} = JSON.parse(safeArgs);

//             logger.info(`\n💡 Transfer event ${safeArgs}`);
//             donate_to_crowd_funding(to, value, from, event.address, event.transactionHash)
//           }

//         } else if (eventKey === POOL_CREATED_SELECTOR) {
//           logger.info("Pool Created");
//           const { args } = decodeEvent({ strict: true, event, abi: crowdfunding_abi, eventName: "contract::base::events::PoolCreated" });
//           const safeArgs = JSON.stringify(args, (_, v) =>
//             typeof v === "bigint" ? v.toString() : v
//           );
//           logger.info(`\n💡 Pool created event ${safeArgs}`);
//           const {pool_address, _, creator, pool_name, target_amount} = JSON.parse(safeArgs);
//           crowd_funding_cache.push(args.pool_address);
//           create_crowd_funding(pool_address, creator, hexToString(pool_name), target_amount)
//         }
//         else if (eventKey === POOL_PAID_SELECTOR) {
//           logger.info("Pool Paid");
//           const { args } = decodeEvent({ strict: true, event, abi: crowdfunding_abi, eventName: "contract::base::events::PoolPaid" });
//           const safeArgs = JSON.stringify(args, (_, v) =>
//             typeof v === "bigint" ? v.toString() : v
//           );
//           logger.info(`\n💡 Pool paid event ${safeArgs}`);
//           const {pool_address, amount, paid_by, _, token_address} = JSON.parse(safeArgs);
//           resolve_crowd_funding(pool_address, amount, token_address, event.transactionHash, paid_by)
//         }
//       }
//     },
//   });
// }

// // function to get all crowd funding contract addresses
// export const crowdFundingContractAddresses = await fetch(
//   `${process.env.API_URL}/crowdfunding/addresses`,
//   {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   },
// )
//   .then((response) => response.json())
//   .then((data: any) => data);

// const create_crowd_funding = (pool_address: string, creator_address: string, name: string, target_amount: string) => { fetch( `${process.env.API_URL}/crowdfunding`, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'paymesh-api-key': `${process.env.PAYMESH_API_KEY}`
//   },
//   body: JSON.stringify({
//     creator_address: creator_address,
//     name: name,
//     pool_address: pool_address,
//     target_amount: target_amount
//   })
// })
// console.log("Crowd funding created: ", pool_address)
// }

// const donate_to_crowd_funding = (crowd_funding_address: string, amount: string, donor_address: string, token_address: string, transaction_hash: string) => fetch(`${process.env.API_URL}/crowdfunding/${crowd_funding_address}/donate`, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'paymesh-api-key': `${process.env.PAYMESH_API_KEY}`
//   },
//   body: JSON.stringify({
//     amount: amount,
//     donor_address: donor_address,
//     token_address: token_address,
//     transaction_hash: transaction_hash
//   })
// })

// const resolve_crowd_funding = (crowd_funding_address: string, amount: string, token_address: string, transaction_hash: string, withdrawn_by: string) => fetch(`${process.env.API_URL}/crowdfunding/${crowd_funding_address}/resolve`, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'paymesh-api-key': `${process.env.PAYMESH_API_KEY}`
//   },
//   body: JSON.stringify({
//     amount: amount,
//     token_address: token_address,
//     transaction_hash: transaction_hash,
//     withdrawn_by: withdrawn_by
//   })
// })

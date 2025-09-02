import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";

import { StarknetStream, getSelector, FieldElement } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl } = runtimeConfig["paymeshStarknet"];
  const config = runtimeConfig.paymeshStarknet;

  const TRANSFER_SELECTOR = getSelector("Transfer");
  const GROUP_CREATED_SELECTOR = getSelector("GroupCreated");

  const group_addresses = new Set<FieldElement>();
  
  let lastPaymentTime = 0;
  const MIN_PAYMENT_INTERVAL = 100;

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt("1843327"),
    filter: {
      events: [
        {
          address: "0x03b7c46011eb99746b120bb4391ff91cdebf84b242aa83adcde7c19fbf7a46a8",
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
      if (!header) return;

      logger.info(`Processing mainnet block: ${header.blockNumber}`);
      
      for (const event of blockEvents) {
        const eventKey = event.keys[0];
        
        if (eventKey === GROUP_CREATED_SELECTOR) {
          const groupAddress = event.keys[1];
          // group_addresses.add(groupAddress);
          logger.info(`✅ GroupCreated: ${groupAddress} | Total groups: ${group_addresses.size}`);
        } 
        else if (eventKey === TRANSFER_SELECTOR) {
          const [, to] = event.data;
          if (group_addresses.has(to)) {
            logger.info(`💰 Transfer to group: ${to}`);
            
            const now = Date.now();
            if (now - lastPaymentTime >= MIN_PAYMENT_INTERVAL) {
              pay(String(to));
              lastPaymentTime = now;
            } else {
              logger.info(`⏳ Rate limiting payment to ${to}`);
            }
          }
        }
      }
    },
  });
}

const pay = (address: string) => {
  fetch(`${process.env.API}/pay_member`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(address),
  }).catch((err) => {
    console.error(`Payment error for ${address}:`, err);
  });
};
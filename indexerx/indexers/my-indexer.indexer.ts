import { defineIndexer } from "apibara/indexer";
import { useLogger } from "apibara/plugins";
import { drizzle, drizzleStorage, useDrizzleStorage } from "@apibara/plugin-drizzle";
import { StarknetStream } from "@apibara/starknet";
import type { ApibaraRuntimeConfig } from "apibara/types";
import { eq, and } from "drizzle-orm";

// Import contract utilities
import { ContractUtils } from "../lib/contract-utils";

// Import all schema tables
import {
  groups,
  groupMembers,
  updateRequests,
  updateRequestNewMembers,
  updateApprovals,
  pendingUpdates,
  events,
  groupPayments,
  contractState,
  cursorTable,
  deployedGroups,
  tokenTransfers,
} from "../lib/schema";

// Create drizzle instance
const drizzleDb = drizzle({
  schema: {
    groups,
    groupMembers,
    updateRequests,
    updateRequestNewMembers,
    updateApprovals,
    pendingUpdates,
    events,
    groupPayments,
    contractState,
    cursorTable,
    deployedGroups,
    tokenTransfers,
  },
});

export default function (runtimeConfig: ApibaraRuntimeConfig) {
  const { startingBlock, streamUrl, contractAddress } = runtimeConfig.myIndexer;

  return defineIndexer(StarknetStream)({
    streamUrl,
    finality: "accepted",
    startingBlock: BigInt(startingBlock),
    filter: {
      events: [
        {
          address: contractAddress as `0x${string}`,
        },
      ],
    },
    plugins: [
      drizzleStorage({
        db: drizzleDb,
        idColumn: "id", // Use the actual "id" column name from our schema
      }),
    ],
    async transform({ block, endCursor }) {
      const logger = useLogger();
      const { events: blockEvents, header } = block;
      
      if (!header) return;
      
      logger.log(`Processing block ${header.blockNumber}`);
      
      const { db } = useDrizzleStorage(drizzleDb);

      let eventErrors = 0;
      for (const event of blockEvents) {
        try {
          await processEvent(db, event, header.blockNumber, BigInt(header.timestamp.getTime()));
        } catch (error) {
          eventErrors++;
          logger.error(`Error processing event ${eventErrors}/${blockEvents.length}: ${error}`);
          // Continue processing other events instead of failing the entire block
        }
      }
      
      if (eventErrors > 0) {
        logger.warn(`Processed block with ${eventErrors} event errors out of ${blockEvents.length} total events`);
      }

      // Update cursor - handle the cursor properly
      if (endCursor) {
        const cursorValue = typeof endCursor === 'object' && 'orderKey' in endCursor 
          ? Number(endCursor.orderKey) 
          : 0;
        
        try {
          await db.insert(cursorTable).values({
            endCursor: cursorValue,
            uniqueKey: "autoshare_indexer",
          }).onConflictDoUpdate({
            target: cursorTable.uniqueKey,
            set: { endCursor: cursorValue },
          });
        } catch (error) {
          console.error("Error updating cursor:", error);
          // If the table doesn't exist yet, just log the error and continue
        }
      }
    },
  });
}

async function processEvent(
  db: any,
  event: any,
  blockNumber: bigint,
  timestamp: bigint
) {
  // Debug: Log the raw event structure
  console.log("Raw event object:", JSON.stringify(event, null, 2));
  
  // Starknet events have a different structure:
  // - keys[0] contains the event name hash
  // - data[] contains the event parameters in order
  let eventName = "UnknownEvent";
  let eventData: any = {};
  
  if (event.keys && event.keys.length > 0) {
    // The first key is the event name as a Fel252 (Cairo field element)
    const eventNameKey = event.keys[0];
    
    // Map known Fel252 event keys to event names
    // These are the Fel252 values of the event names from the Cairo contract
    // We need to get the actual Fel252 values from the contract events
    const eventNameMap: { [key: string]: string } = {
      // These are example Fel252 values - we need to get the actual ones from the contract
      // For now, let's try to decode the first key to see what we get
    };
    
    // Convert Fel252 to string for comparison
    let eventKeyString: string;
    if (typeof eventNameKey === 'string') {
      eventKeyString = eventNameKey;
    } else if (typeof eventNameKey === 'object' && eventNameKey.x0 !== undefined) {
      // Handle Starknet field element format
      eventKeyString = `0x${eventNameKey.x0.toString(16)}`;
    } else {
      eventKeyString = String(eventNameKey);
    }
    
    console.log("Event key (Fel252):", eventKeyString);
    console.log("🔍 Event keys array:", event.keys);
    console.log("🔍 Event data array:", event.data);
    
    // For now, let's try to identify events by their data structure
    // GroupCreated typically has 6 parameters: group_id, creator, name, group_address, ?, ?
    // GroupPaid typically has 6 parameters: group_id, amount, paid_by, paid_at, members, ?
    if (event.data && event.data.length === 6) {
      // Based on the pattern we observed, these are likely GroupCreated events
      // The first key 0x00839204f70183a4f6833c236b5e21b7309088e1defb43d00a9945ac05fdb27d
      // appears to be the GroupCreated event identifier
      if (eventKeyString === "0x00839204f70183a4f6833c236b5e21b7309088e1defb43d00a9945ac05fdb27d") {
        eventName = "GroupCreated";
        console.log("✅ Identified GroupCreated event by Fel252 key");
      } else {
        eventName = "UnknownEvent";
      }
    } else if (event.data && event.data.length === 4) {
      eventName = "GroupCreated";
    } else if (event.data && event.data.length === 5) {
      eventName = "GroupPaid";
    } else {
      eventName = "UnknownEvent";
    }
    
          // Parse event data from the data array and keys array
      if (event.data && event.data.length > 0) {
        // Convert the data array to a more readable format
        eventData = {
          raw_data: event.data,
          // For now, store the raw data and we can parse specific events
        };
        
        // Parse specific event types based on their known structure
        if (eventName === "GroupCreated") {
          // GroupCreated event structure:
          // data[0] = group_id
          // data[1] = creator  
          // data[2] = name
          // keys[1] = group_address (deployed contract address)
          eventData = {
            group_id: event.data[0],
            creator: event.data[1], 
            name: event.data[2],
            group_address: event.keys && event.keys.length > 1 ? event.keys[1] : event.data[3]
          };
          console.log("🔍 Parsed GroupCreated event - group_address from keys[1]:", eventData.group_address);
        } else if (eventName === "GroupPaid") {
          // GroupPaid event: (group_id, amount, paid_by, paid_at, members)
          eventData = {
            group_id: event.data[0],
            amount: event.data[1],
            paid_by: event.data[2],
            paid_at: event.data[3],
            members: event.data[4]
          };
        }
      }
  }
  
  // Extract transaction hash
  let transactionHash = "";
  if (event.transactionHash) {
    transactionHash = event.transactionHash;
  } else if (event.transaction_hash) {
    transactionHash = event.transaction_hash;
  } else if (event.tx_hash) {
    transactionHash = event.tx_hash;
  } else if (event.hash) {
    transactionHash = event.hash;
  }

  // Validate that we have essential data
  if (!eventName || eventName === "UnknownEvent") {
    console.error("Could not determine event name from event:", event);
    // Store as unknown event instead of failing
    eventName = "UnknownEvent";
  }

  // Store the event record
  const eventRecord = {
    event_type: eventName,
    group_id: null,
    transaction_hash: transactionHash || "unknown",
    block_number: Number(blockNumber),
    block_timestamp: Number(timestamp),
    event_data: JSON.stringify(eventData),
  };

  // Log the processed event for debugging
  console.log(`Processing event: ${eventName}`, { 
    eventData, 
    transactionHash, 
    blockNumber: Number(blockNumber),
    timestamp: Number(timestamp)
  });

  try {
    switch (eventName) {
      case "GroupCreated":
        await handleGroupCreated(db, eventData, eventRecord, blockNumber, timestamp);
        break;
      case "GroupPaid":
        await handleGroupPaid(db, eventData, eventRecord);
        break;
      case "GroupUpdateRequested":
        await handleGroupUpdateRequested(db, eventData, eventRecord);
        break;
      case "GroupUpdateApproved":
        await handleGroupUpdateApproved(db, eventData, eventRecord);
        break;
      case "GroupUpdated":
        await handleGroupUpdated(db, eventData, eventRecord);
        break;
      case "TokenTransfer":
        await handleTokenTransfer(db, eventData, eventRecord, blockNumber, timestamp);
        break;
      default:
        // Store unknown events
        console.log(`Storing unknown event: ${eventName}`);
        await db.insert(events).values(eventRecord);
    }
  } catch (error) {
    console.error(`Error processing event ${eventName}:`, error);
    // Still try to store the event record even if processing fails
    try {
      await db.insert(events).values(eventRecord);
    } catch (insertError) {
      console.error("Failed to store event record:", insertError);
    }
  }
}

async function handleGroupCreated(db: any, eventData: any, eventRecord: any, blockNumber: bigint, timestamp: bigint) {
  try {
    const { group_address, group_id, creator, name } = eventData;
    
    console.log("Processing GroupCreated event data:", eventData);
    
    // Convert Starknet field values properly
    // group_id might be a hex string or object, convert to number
    let groupId: number;
    if (typeof group_id === 'string') {
      groupId = parseInt(group_id, 16);
    } else if (typeof group_id === 'object' && group_id.x0 !== undefined) {
      // Handle Starknet field element format
      groupId = Number(group_id.x0);
    } else {
      groupId = Number(group_id);
    }
    
    // Convert creator address
    let creatorAddress: string;
    if (typeof creator === 'string') {
      creatorAddress = creator;
    } else if (typeof creator === 'object' && creator.x0 !== undefined) {
      // Handle Starknet field element format
      creatorAddress = `0x${creator.x0.toString(16)}`;
    } else {
      creatorAddress = String(creator);
    }
    
    // Convert name (might be hex encoded)
    let groupName: string;
    if (typeof name === 'string') {
      if (name.startsWith('0x')) {
        // Convert hex to string
        groupName = Buffer.from(name.slice(2), 'hex').toString('utf8').replace(/\0/g, '');
      } else {
        groupName = name;
      }
    } else if (typeof name === 'object' && name.x0 !== undefined) {
      // Handle Starknet field element format
      const hexName = `0x${name.x0.toString(16)}`;
      groupName = Buffer.from(hexName.slice(2), 'hex').toString('utf8').replace(/\0/g, '');
    } else {
      groupName = String(name);
    }
    
    // Convert group address
    let childContractAddress: string;
    if (typeof group_address === 'string') {
      childContractAddress = group_address;
    } else if (typeof group_address === 'object' && group_address.x0 !== undefined) {
      // Handle Starknet field element format
      childContractAddress = `0x${group_address.x0.toString(16)}`;
    } else {
      childContractAddress = String(group_address);
    }
    
    console.log("Converted values:", {
      groupId,
      creatorAddress,
      groupName,
      childContractAddress
    });
    
    // Update event record with group_id
    eventRecord.group_id = groupId;
    
    // Check if group already exists
    const existingGroup = await db.select().from(groups).where(eq(groups.group_id, groupId)).limit(1);
    
    if (existingGroup.length === 0) {
      // Insert new group
      await db.insert(groups).values({
        group_id: groupId,
        name: groupName,
        is_paid: false,
        creator: creatorAddress,
        status: "active",
      });
      console.log(`✅ Inserted new group ${groupId}`);
    } else {
      // Update existing group
      await db.update(groups).set({
        name: groupName,
        creator: creatorAddress,
        updated_at: new Date(),
      }).where(eq(groups.group_id, groupId));
      console.log(`🔄 Updated existing group ${groupId}`);
    }

    // Check if deployed group already exists
    const existingDeployedGroup = await db.select().from(deployedGroups).where(eq(deployedGroups.group_id, groupId)).limit(1);
    
    if (existingDeployedGroup.length === 0) {
      // Insert new deployed group
      await db.insert(deployedGroups).values({
        group_id: groupId,
        deployed_address: childContractAddress,
        is_active: true,
        deployment_block: Number(blockNumber),
        deployment_timestamp: Number(timestamp),
      });
      console.log(`✅ Inserted new deployed group ${groupId} at ${childContractAddress}`);
    } else {
      // Update existing deployed group
      await db.update(deployedGroups).set({
        deployed_address: childContractAddress,
        is_active: true,
        deployment_block: Number(blockNumber),
        deployment_timestamp: Number(timestamp),
        updated_at: new Date(),
      }).where(eq(deployedGroups.group_id, groupId));
      console.log(`🔄 Updated existing deployed group ${groupId} at ${childContractAddress}`);
    }

    // Store event
    await db.insert(events).values(eventRecord);
    
    console.log("Successfully processed GroupCreated event");
  } catch (error) {
    console.error("Error in handleGroupCreated:", error);
    throw error;
  }
}

async function handleGroupPaid(db: any, eventData: any, eventRecord: any) {
  const { group_id, amount, paid_by, paid_at, members } = eventData;
  
  // Update event record with group_id
  eventRecord.group_id = Number(group_id);
  
  // Update group status
  await db
    .update(groups)
    .set({ 
      is_paid: true, 
      status: "paid",
    })
    .where(eq(groups.group_id, Number(group_id)));

  // Insert payment record
  await db.insert(groupPayments).values({
    group_id: Number(group_id),
    amount: Number(amount),
    paid_by: paid_by,
    paid_at: Number(paid_at),
    transaction_hash: eventRecord.transaction_hash,
  });

  // Store event
  await db.insert(events).values(eventRecord);
}

async function handleGroupUpdateRequested(db: any, eventData: any, eventRecord: any) {
  const { group_id, requester, new_name } = eventData;
  
  // Update event record with group_id
  eventRecord.group_id = Number(group_id);
  
  // Insert update request
  await db.insert(updateRequests).values({
    group_id: Number(group_id),
    new_name: new_name,
    requester: requester,
    fee_paid: true, // Assuming fee is paid when request is made
    approval_count: 0,
    is_completed: false,
  });

  // Set pending update flag
  await db.insert(pendingUpdates).values({
    group_id: Number(group_id),
    has_pending_update: true,
  }).onConflictDoUpdate({
    target: pendingUpdates.group_id,
    set: { 
      has_pending_update: true,
    },
  });

  // Update group status
  await db
    .update(groups)
    .set({ 
      status: "updating",
    })
    .where(eq(groups.group_id, Number(group_id)));

  // Store event
  await db.insert(events).values(eventRecord);
}

async function handleGroupUpdateApproved(db: any, eventData: any, eventRecord: any) {
  const { group_id, approver, approval_count, total_members } = eventData;
  
  // Update event record with group_id
  eventRecord.group_id = Number(group_id);
  
  // Insert or update approval
  await db.insert(updateApprovals).values({
    group_id: Number(group_id),
    member_address: approver,
    has_approved: true,
  }).onConflictDoUpdate({
    target: [updateApprovals.group_id, updateApprovals.member_address],
    set: { 
      has_approved: true,
    },
  });

  // Update approval count in update request
  await db
    .update(updateRequests)
    .set({ 
      approval_count: Number(approval_count),
    })
    .where(eq(updateRequests.group_id, Number(group_id)));

  // Store event
  await db.insert(events).values(eventRecord);
}

async function handleGroupUpdated(db: any, eventData: any, eventRecord: any) {
  const { group_id, old_name, new_name } = eventData;
  
  // Update event record with group_id
  eventRecord.group_id = Number(group_id);
  
  // Update group with new name and reset status
  await db
    .update(groups)
    .set({ 
      name: new_name,
      is_paid: false,
      status: "active",
    })
    .where(eq(groups.group_id, Number(group_id)));

  // Clear pending update flag
  await db
    .update(pendingUpdates)
    .set({ 
      has_pending_update: false,
    })
    .where(eq(pendingUpdates.group_id, Number(group_id)));

  // Clear update request
  await db
    .update(updateRequests)
    .set({ 
      is_completed: true,
    })
    .where(eq(updateRequests.group_id, Number(group_id)));

  // Store event
  await db.insert(events).values(eventRecord);
}

async function handleTokenTransfer(db: any, eventData: any, eventRecord: any, blockNumber: bigint, timestamp: bigint) {
  try {
    const { from, to, amount, token_address } = eventData;
    
    console.log("Processing TokenTransfer event:", eventData);
    
    // Check if the recipient address is a deployed group address
    const deployedGroup = await db.select().from(deployedGroups).where(eq(deployedGroups.deployed_address, to)).limit(1);
    const deployedGroupData = deployedGroup[0];
    
    if (deployedGroupData) {
      console.log(`Token transfer detected to group ${deployedGroupData.group_id} at address ${to}`);
      
      // Store the token transfer
      await db.insert(tokenTransfers).values({
        group_id: deployedGroupData.group_id,
        deployed_address: to,
        token_address: token_address,
        amount: Number(amount),
        from_address: from,
        transaction_hash: eventRecord.transaction_hash,
        block_number: Number(blockNumber),
        block_timestamp: Number(timestamp),
        is_processed: false,
      });
      
      // Trigger payment to group members
      const paymentResult = await ContractUtils.triggerGroupPayment(db, deployedGroupData.group_id, to, token_address, amount);
      
      // Mark the transfer as processed
      await db
        .update(tokenTransfers)
        .set({ 
          is_processed: true,
          payment_tx_hash: paymentResult.transactionHash || eventRecord.transaction_hash,
        })
        .where(eq(tokenTransfers.transaction_hash, eventRecord.transaction_hash));
      
      console.log(`Payment triggered for group ${deployedGroupData.group_id}`);
    }
    
    // Store event
    await db.insert(events).values(eventRecord);
    
  } catch (error) {
    console.error("Error in handleTokenTransfer:", error);
    throw error;
  }
}



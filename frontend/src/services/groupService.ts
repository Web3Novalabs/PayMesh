import {
  Group,
  GroupSummary,
  CreateGroupRequest,
  EditGroupRequest,
  SplitFundsRequest,
} from "@/types/group";
import { GroupDetails } from "@/types/groups";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export class GroupService {
  // Get group details by address
  static async getGroupDetailsByAddress(
    address: string
  ): Promise<GroupDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${address}`);
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching group details by address:", error);
      throw error;
    }
  }

  // Get all groups for a user
  static async getUserGroups(userAddress: string): Promise<GroupSummary[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/user/${userAddress}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user groups:", error);
      throw error;
    }
  }

  // Get specific group details
  static async getGroupDetails(groupId: number): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching group details:", error);
      throw error;
    }
  }

  // Create a new group
  static async createGroup(
    groupData: CreateGroupRequest,
    userAddress: string
  ): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...groupData,
          creatorAddress: userAddress,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  }

  // Edit an existing group
  static async editGroup(groupData: EditGroupRequest): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error editing group:", error);
      throw error;
    }
  }

  // Split funds in a group
  static async splitFunds(
    splitData: SplitFundsRequest
  ): Promise<{ success: boolean; transactionHash?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${splitData.groupId}/split-funds`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(splitData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error splitting funds:", error);
      throw error;
    }
  }

  // Get group transaction history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getGroupTransactions(groupId: number): Promise<any[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/transactions`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching group transactions:", error);
      throw error;
    }
  }

  // Get group balance
  static async getGroupBalance(
    groupId: number,
    tokenAddress: string
  ): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/balance?token=${tokenAddress}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error("Error fetching group balance:", error);
      throw error;
    }
  }

  // Add member to group
  static async addMemberToGroup(
    groupId: number,
    memberAddress: string,
    percentage: number
  ): Promise<Group> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberAddress,
            percentage,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error adding member to group:", error);
      throw error;
    }
  }

  // Remove member from group
  static async removeMemberFromGroup(
    groupId: number,
    memberAddress: string
  ): Promise<Group> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/groups/${groupId}/members/${memberAddress}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error removing member from group:", error);
      throw error;
    }
  }
  // Get all groups
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getAllGroups(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching all groups:", error);
      throw error;
    }
  }
}

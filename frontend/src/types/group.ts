export interface GroupMember {
  id: number;
  address: string;
  type: "Equal" | "Custom" | "Percentage";
  percentage: number;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Failed";
}

export interface Group {
  id: number;
  name: string;
  members: number;
  dateCreated: string;
  totalAmount: string;
  groupAddress: string;
  role: "Creator" | "Member" | "Admin";
  membersList: GroupMember[];
  isCreator: boolean;
}

export interface GroupSummary {
  id: number;
  name: string;
  role: "Creator" | "Member" | "Admin";
  members: number;
  dateCreated: string;
  isCreator: boolean;
}

export interface CreateGroupRequest {
  name: string;
  members: string[];
  percentages: number[];
  totalAmount: string;
  tokenAddress: string;
}

export interface EditGroupRequest {
  id: number;
  name?: string;
  members?: string[];
  percentages?: number[];
}

export interface SplitFundsRequest {
  groupId: number;
  amount: string;
  tokenAddress: string;
  distributionType: "Equal" | "Custom" | "Percentage";
  percentages?: number[];
}

export interface TransactionData {
  id: number;
  groupAddress: string;
  amount: string;
  date: string;
  rawTime: string;
}

export interface GroupTransactionData {
  group_data: {
    created_at: string;
    created_by: string;
    group_address: string;
    group_name: string;
    members: Array<{
      added_at: string;
      is_active: boolean;
      member_address: string;
      member_percentage: string;
    }>;
    updated_at: string;
    usage_remaining: string;
  };
  share_eth: string;
  share_strk: string;
  share_usdc: string;
  share_usdt: string;
}

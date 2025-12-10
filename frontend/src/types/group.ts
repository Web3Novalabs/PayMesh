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
  group_address: string;
  group_name: string;
  created_by: string;
  usage_remaining: string;
  created_at: string;
  updated_at: string;
  members: Array<{
    member_address: string;
    member_percentage: string;
    is_active: boolean;
    added_at: string;
  }>;
  history: Array<{
    total_amount_paid: string;
    token_address: string;
    tx_hash: string;
    paid_at: string;
    members: Array<{
      member_address: string;
      member_amount: string;
      member_percentage: string;
    }>;
  }>;
}

export type SplitType = "equal" | "manual" | "";

export interface Member {
  id: string;
  address: string;
  percentage?: number;
}

export interface CreateGroupFormData {
  name: string;
  usage: string;
  members: GroupMemberShare[];
  agreeTerms: boolean;
}

export interface GroupMemberShare {
  id: string;
  addr: string;
  percentage?: number;
  isValidating?: boolean;
  networkResult?: string | null;
}

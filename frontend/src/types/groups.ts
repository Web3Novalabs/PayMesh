export interface GroupMemberDetails {
  member_address: string;
  member_percentage: string;
  is_active: boolean;
  added_at: string;
}

export interface MemberPaymentDetails {
  member_address: string;
  member_amount: string;
  member_percentage: string;
}

export interface HistoryItem {
  total_amount_paid: string;
  token_address: string;
  tx_hash: string;
  paid_at: string;
  members: MemberPaymentDetails[];
}

export interface GroupDetails {
  group_address: string;
  group_name: string;
  created_by: string;
  usage_remaining: string;
  created_at: string;
  updated_at: string;
  members: GroupMemberDetails[];
  history: HistoryItem[];
}

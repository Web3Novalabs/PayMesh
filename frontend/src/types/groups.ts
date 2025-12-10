export interface GroupMemberPayment {
  member_address: string;
  member_amount: string;
  member_percentage: string;
}

export interface HistoryItem {
  paid_at: string;
  token_address: string;
  total_amount_paid: string;
  tx_hash: string;
  members: GroupMemberPayment[];
}

export interface GroupDetails {
  group_name: string;
  group_address: string;
  created_at: string;
  history: HistoryItem[];
}

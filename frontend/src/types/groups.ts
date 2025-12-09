export interface GroupMemberDetails {
  member_address: string;
  member_percentage: string;
  is_active: boolean;
  added_at: string;
}

export interface GroupDetails {
  group_address: string;
  group_name: string;
  created_by: string;
  usage_remaining: string;
  created_at: string;
  updated_at: string;
  members: GroupMemberDetails[];
}

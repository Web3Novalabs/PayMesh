export interface UsdcBalanceProps {
  crowd_funding: {
    target_amount: string;
    creator_address: string;
    id: number;
    is_complete: boolean;
  };
  token_history: Array<{
    token_address: string;
    balance: string;
  }>;
  donation_count: {
    total_donors: string;
    total_numbers_of_donations: string;
  };
}

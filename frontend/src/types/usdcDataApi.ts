export interface FundraiseDetailsProps {
  crowd_funding: {
    target_amount: string;
    creator_address: string;
    id: number;
    is_complete: boolean;
    description: string;
    pool_address: string;
    name: string;
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

export type pool = {
  crowd_funding: {
    target_amount: string;
    creator_address: string;
    id: number;
    is_complete: boolean;
    description: string;
    name: string;
    pool_address: string;
  };
  token_history: Array<{
    token_address: string;
    balance: string;
  }>;
  donation_count: {
    total_donors: string;
    total_numbers_of_donations: string;
  };
};

export interface FormData {
  name: string;
  description: string;
  tokenType: string;
  targetAmount: string;
  walletAddress: string;
}

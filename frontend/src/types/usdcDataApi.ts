export const USDC_TOKEN_ADDRESS =
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";

export interface FundraiseDetailsProps {
  crowd_funding: {
    target_amount: string;
    creator_address: string;
    id: number;
    is_complete: boolean;
    description: string;
    pool_address: string;
    name: string;
    created_at: string;
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

export interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool_address: string;
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

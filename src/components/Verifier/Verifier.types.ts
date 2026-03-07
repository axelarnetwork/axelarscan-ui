export interface VerifierPollEntry {
  id?: string;
  height?: number;
  sender_chain?: string;
  poll_id?: string;
  vote?: boolean;
  [key: string]: unknown;
}

export interface VerifierSignEntry {
  id?: string;
  height?: number;
  chain?: string;
  destination_chain?: string;
  session_id?: string;
  sign?: boolean;
  [key: string]: unknown;
}

export interface RewardEntry {
  height?: number;
  chain?: string;
  amount?: number;
  created_at?: { ms?: number };
  [key: string]: unknown;
}

export interface CumulativeRewardsData {
  total_rewards?: number;
  chains?: RewardEntry[];
  [key: string]: unknown;
}

export interface VerifierBondingState {
  Bonded?: { amount?: number; [key: string]: unknown };
  [key: string]: unknown;
}

export interface VerifierChainEntry {
  address?: string;
  bonding_state?: VerifierBondingState;
  authorization_state?: string;
  weight?: number;
  [key: string]: unknown;
}

export interface VerifierData {
  address?: string;
  supportedChains?: string[];
  status?: string;
  code?: number;
  message?: string;
  [key: string]: unknown;
}

export interface InfoProps {
  data: VerifierData;
  address: string;
  rewards: RewardEntry[] | null;
  cumulativeRewards: CumulativeRewardsData | null;
}

export interface VotesProps {
  data: VerifierPollEntry[] | null;
}

export interface SignsProps {
  data: VerifierSignEntry[] | null;
}

export interface VerifierProps {
  address: string;
}

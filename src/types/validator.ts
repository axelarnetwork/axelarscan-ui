export interface ValidatorDescription {
  moniker?: string;
  details?: string;
  website?: string;
  identity?: string;
  security_contact?: string;
}

export interface CommissionRates {
  rate?: number;
  max_rate?: number;
  max_change_rate?: number;
}

export interface ValidatorCommission {
  commission_rates?: CommissionRates;
}

export interface BroadcasterBalance {
  amount?: number;
  symbol?: string;
  denom?: string;
}

export interface Validator {
  operator_address: string;
  consensus_address?: string;
  delegator_address?: string;
  broadcaster_address?: string;
  status?: string;
  tokens?: number;
  quadratic_voting_power?: number;
  jailed?: boolean;
  uptime?: number;
  heartbeats_uptime?: number;
  proposed_blocks?: number;
  proposed_blocks_proportion?: number;
  description?: ValidatorDescription;
  commission?: ValidatorCommission;
  broadcasterBalance?: BroadcasterBalance;
  supportedChains?: string[];
  [key: string]: unknown;
}

export interface Delegation {
  delegator_address: string;
  amount?: number;
  denom?: string;
}

export interface UptimeBlock {
  height: number;
  status?: boolean;
  validators?: string[];
}

export interface ProposedBlock {
  height: number;
  proposer?: string;
}

export interface EVMVote {
  id?: string;
  height?: number;
  sender_chain?: string;
  vote?: boolean;
  txhash?: string;
  [key: string]: unknown;
}

export interface ValidatorsVotesChain {
  votes?: Record<string, number>;
  total?: number;
  total_polls?: number;
}

export interface ValidatorsVotesEntry {
  total?: number;
  chains?: Record<string, ValidatorsVotesChain>;
}

export interface ValidatorsVotesResponse {
  data?: Record<string, ValidatorsVotesEntry>;
  total?: number;
}

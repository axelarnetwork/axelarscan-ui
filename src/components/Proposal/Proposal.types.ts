import type { Chain } from '@/types';

export interface ProposalDeposit {
  amount?: number;
  symbol?: string;
}

export interface ProposalContent {
  plan?: { name?: string; height?: number; info?: string };
  title?: string;
  description?: string;
  changes?: { key?: string; value?: string; subspace?: string }[];
  contract_calls?: { chain?: string }[];
}

export interface ProposalData {
  proposal_id?: string;
  type?: string;
  content?: ProposalContent;
  status?: string;
  submit_time?: string;
  deposit_end_time?: string;
  voting_start_time?: string;
  voting_end_time?: number;
  total_deposit?: ProposalDeposit[];
  final_tally_result?: Record<string, number>;
  votes?: VoteEntry[];
  [key: string]: unknown;
}

export interface VoteEntry {
  voter?: string;
  option?: string;
  validatorData?: { operator_address: string; description?: { moniker?: string }; tokens?: number };
  voting_power?: number;
}

export interface VoteOptionSummary {
  option: string;
  value: number;
}

export interface InfoProps {
  id: string;
  data: ProposalData;
  end: boolean;
  voteOptions: VoteOptionSummary[];
}

export interface VoteRowProps {
  entry: VoteEntry;
  index: number;
  totalVotingPower: number;
}

export interface StatusTagProps {
  status: string;
}

export interface PlanInfoProps {
  info: string;
  type?: string;
}

export interface ChangeRowProps {
  keyName?: string;
  value?: string;
  subspace?: string;
}

export interface GmpChainIconProps {
  chain?: string;
  chains: Chain[] | null;
}

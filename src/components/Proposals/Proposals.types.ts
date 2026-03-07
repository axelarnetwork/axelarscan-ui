export interface ProposalDeposit {
  amount?: number;
  symbol?: string;
}

export interface ProposalListItem {
  proposal_id?: string;
  type?: string;
  content?: {
    title?: string;
    description?: string;
    plan?: { name?: string; height?: number };
  };
  status?: string;
  voting_start_time?: string;
  voting_end_time?: string;
  total_deposit?: ProposalDeposit[];
  final_tally_result?: Record<string, number>;
  [key: string]: unknown;
}

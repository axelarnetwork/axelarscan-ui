export interface SelectOption {
  value?: string;
  title: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  multiple?: boolean;
  searchable?: boolean;
  options?: SelectOption[];
}

export interface PollVoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

export interface AmplifierPollEntry {
  id: string;
  poll_id?: string;
  contract_address?: string;
  transaction_id?: string;
  sender_chain?: string;
  status?: string;
  height?: number;
  participants?: string[];
  voteOptions?: PollVoteOption[];
  created_at?: { ms?: number };
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  expired_height?: number;
  [key: string]: unknown;
}

export interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  option?: string;
  [key: string]: unknown;
}

export interface PollRowProps {
  poll: AmplifierPollEntry;
  chains: ReturnType<typeof import('@/hooks/useGlobalData').useChains>;
}

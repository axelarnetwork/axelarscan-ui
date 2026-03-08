import type { Asset, Validator } from '@/types';

export interface VoteOption {
  option: string;
  value: number;
  voters: string[];
  i?: number;
}

export interface PollVote {
  voter?: string;
  vote?: boolean;
  height?: number;
  id?: string;
  created_at?: number;
  option?: string;
  confirmed?: boolean;
  validatorData?: Validator;
  confirmedFlag?: number;
  [key: string]: unknown;
}

export interface ConfirmationEvent {
  type?: string;
  txID?: string;
  asset?: string;
  symbol?: string;
  amount?: string;
  [key: string]: unknown;
}

export interface Timestamp {
  ms?: number;
}

export interface EVMPollData {
  poll_id?: string;
  transaction_id?: string;
  sender_chain?: string;
  event?: string;
  eventName?: string;
  confirmation_events?: ConfirmationEvent[];
  status?: string;
  height?: number;
  initiated_txhash?: string;
  confirmation_txhash?: string;
  transfer_id?: number;
  deposit_address?: string;
  participants?: string[];
  voteOptions?: VoteOption[];
  votes?: PollVote[];
  created_at?: Timestamp;
  updated_at?: Timestamp;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  confirmation?: boolean;
  url?: string;
  idNumber?: number | string;
  id?: string;
  [key: string]: unknown;
}

export interface InfoProps {
  data: EVMPollData;
  id: string;
}

export interface VotesProps {
  data: EVMPollData;
}

export interface ConfirmationAssetProps {
  event: ConfirmationEvent;
  chain: string | undefined;
  url: string | undefined;
  assets: Asset[] | null | undefined;
  index: number;
}

export interface ParticipantOptionProps {
  option: VoteOption;
  validators: Validator[];
  totalParticipantsPower: number;
  createdAtMs: number | undefined;
  index: number;
}

export interface VoteRowProps {
  vote: PollVote;
  index: number;
  totalVotingPower: number;
  initiatedTxhash: string | undefined;
  confirmationTxhash: string | undefined;
}

export interface EVMPollProps {
  id: string;
  initialData?: { data?: EVMPollData[] };
}

import type { Asset, Chain, Validator } from '@/types';

/** Shape of a single vote extracted from poll data via getValuesOfAxelarAddressKey */
export interface PollVote {
  voter?: string;
  vote?: boolean;
  confirmed?: boolean;
  id?: string;
  height?: number;
  created_at?: { ms?: number };
  option?: string;
  [key: string]: unknown;
}

/** Aggregated vote option bucket */
export interface VoteOption {
  option: string;
  value: number;
  voters?: string[];
  i?: number;
}

/** Confirmation event embedded in a poll record */
export interface ConfirmationEvent {
  type?: string;
  txID?: string;
  asset?: string;
  symbol?: string;
  amount?: string | number;
  [key: string]: unknown;
}

/** A single EVM poll record from the API */
export interface EVMPollRecord {
  id: string;
  event?: string;
  sender_chain?: string;
  transaction_id?: string;
  transfer_id?: string;
  deposit_address?: string;
  height?: number;
  success?: boolean;
  failed?: boolean;
  expired?: boolean;
  confirmation?: boolean;
  participants?: string[];
  confirmation_events?: ConfirmationEvent[];
  created_at?: { ms?: number };
  initiated_txhash?: string;
  [key: string]: unknown;
}

/** Enriched poll record after processing */
export interface ProcessedPoll extends EVMPollRecord {
  idNumber: number | string;
  status: string;
  confirmation_txhash?: string;
  votes: PollVote[];
  voteOptions: VoteOption[];
  eventName: string;
  url: string;
}

/** Shape of the parsed asset JSON from toJson */
export interface AssetJson {
  denom?: string;
  amount?: string | number;
}

/** Search results keyed by parameter hash */
export interface SearchResultEntry {
  data: ProcessedPoll[];
  total: number;
}

export type SearchResults = Record<string, SearchResultEntry>;

export interface EVMPollsProps {
  initialData?: SearchResultEntry | null;
}

/** Props for the PollRow sub-component */
export interface PollRowProps {
  poll: ProcessedPoll;
  chains: Chain[] | null;
  assets: Asset[] | null;
  validators: Validator[] | null;
}

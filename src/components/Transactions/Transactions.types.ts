import type { Asset } from '@/types';

// ─── Constants ──────────────────────────────────────────────────
export const PAGE_SIZE = 25;
export const SIZE_PER_PAGE = 10;

// ─── Transaction Data ───────────────────────────────────────────

export interface TransactionMessage {
  '@type'?: string;
  msg?: string | Record<string, unknown>;
  sender?: string;
  signer?: string;
  from_address?: string;
  to_address?: string;
  receiver?: string;
  amount?: TransactionAmount[] | string;
  token?: TransactionAmount;
  chain?: string;
  denom?: string;
  asset?: string | { name?: string; [key: string]: unknown };
  deposit_address?: string;
  burner_address?: string;
  tx_id?: string;
  source_channel?: string;
  destination_channel?: string;
  timeout_timestamp?: string | number;
  packet?: Record<string, unknown>;
  acknowledgement?: string;
  inner_message?: TransactionInnerMessage;
  delegator_address?: string;
  validator_address?: string;
  [key: string]: unknown;
}

export interface TransactionInnerMessage {
  '@type'?: string;
  [key: string]: unknown;
}

export interface TransactionAmount {
  denom?: string;
  amount?: string | number;
  [key: string]: unknown;
}

export interface VoteEvent {
  tx_id?: string | Uint8Array;
  status?: string;
  [key: string]: unknown;
}

export interface VoteData {
  chain?: string;
  events?: VoteEvent[];
  [key: string]: unknown;
}

export interface TransactionData {
  tx?: {
    body?: { messages?: TransactionMessage[] };
    auth_info?: {
      fee?: {
        amount?: TransactionAmount[];
      };
    };
  };
  txhash?: string;
  height?: number;
  timestamp?: number;
  code?: number;
  types?: string[];
  type?: string;
  denom?: string;
  asset?: string;
  events?: CosmosEventLike[];
  logs?: CosmosLogLike[];
  [key: string]: unknown;
}

export interface CosmosEventLike {
  type: string;
  attributes?: CosmosAttributeLike[];
}

export interface CosmosLogLike {
  msg_index?: number;
  events?: CosmosEventLike[];
}

export interface CosmosAttributeLike {
  key: string;
  value?: string | null;
  index?: boolean;
}

export interface TransactionActivity {
  type?: string;
  action?: string;
  sender?: string;
  recipient?: string | string[];
  signer?: string;
  chain?: string;
  asset_data?: Asset | undefined;
  symbol?: string;
  denom?: string;
  amount?: string | number;
  send_packet_data?: Record<string, string | null | undefined>;
  packet?: Record<string, unknown>;
  acknowledgement?: string;
  source_channel?: string;
  destination_channel?: string;
  timeout_timestamp?: string | number;
  deposit_address?: string;
  burner_address?: string;
  tx_id?: string;
  asset?: string;
  status?: string;
  poll_id?: string;
  events?: Array<{ event: string; [key: string]: string }>;
  failed?: boolean;
  packet_data?: PacketData | string;
  [key: string]: unknown;
}

export interface PacketData {
  denom?: string;
  amount?: string | number;
  [key: string]: unknown;
}

// ─── Filters ────────────────────────────────────────────────────
export interface FiltersProps {
  address?: string;
}

// ─── Transactions ───────────────────────────────────────────────
export interface TransactionsProps {
  height?: string | number;
  address?: string;
}

export interface TransactionRowData extends TransactionData {
  type?: string;
  sender?: string;
  recipient?: string;
}

export interface SearchResultEntry {
  data: TransactionRowData[];
  total: number;
}

export type SearchResults = Record<string, SearchResultEntry>;

export interface TransactionRowProps {
  data: TransactionRowData;
  height?: string | number;
  address?: string;
  chains: ReturnType<typeof import('@/hooks/useGlobalData').useChains>;
}

export interface TypesAggregationBucket {
  key: string;
  doc_count?: number;
}

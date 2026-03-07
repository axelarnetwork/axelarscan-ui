import type { Chain, Asset } from '@/types';

/** Aggregation bucket returned by the searchBatches aggs query */
export interface AggBucket {
  key: string;
  doc_count?: number;
}

/** Command params shape nested within a batch command */
export interface CommandParams {
  amount?: string;
  name?: string;
  cap?: number;
  account?: string;
  salt?: string;
  newOwners?: string;
  newOperators?: string;
  newWeights?: string;
  newThreshold?: string;
  sourceChain?: string;
  sourceTxHash?: string;
  contractAddress?: string;
  symbol?: string;
  decimals?: number;
}

/** A single command inside an EVM batch */
export interface BatchCommand {
  id: string;
  type: string;
  executed?: boolean;
  transactionHash?: string;
  deposit_address?: string;
  params?: CommandParams;
}

/** An EVM batch record returned from the API */
export interface BatchRecord {
  batch_id: string;
  chain: string;
  key_id?: string;
  status?: string;
  commands?: BatchCommand[];
  created_at?: { ms: number };
}

/** Shape of the search batches API response */
export interface BatchSearchResponse {
  data?: BatchRecord[];
  total?: number;
}

/** Cached search results keyed by serialized params */
export type SearchResultsMap = Record<string, BatchSearchResponse>;

export interface BatchRowProps {
  batch: BatchRecord;
  chains: Chain[] | null;
  assets: Asset[] | null;
}

export interface CommandItemProps {
  command: BatchCommand;
  batch: BatchRecord;
  chains: Chain[] | null;
  assets: Asset[] | null;
  explorerUrl?: string;
  transactionPath?: string;
}

/** Number of results per page */
export const PAGE_SIZE = 25;

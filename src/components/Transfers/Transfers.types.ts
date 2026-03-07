import type { Asset } from '@/types';

// Re-export shared filter types used by Transfers.Filters
export type { FilterOption, FilterAttribute } from '@/types';

export interface TransfersProps {
  address?: string;
}

export interface TransferSend {
  txhash: string;
  source_chain: string;
  destination_chain?: string;
  sender_address?: string;
  recipient_address?: string;
  denom: string;
  amount?: string | number;
  fee?: number;
  insufficient_fee?: boolean;
  created_at?: { ms: number };
  value?: number;
  [key: string]: unknown;
}

export interface TransferLink {
  recipient_address?: string;
  deposit_address?: string;
  destination_chain?: string;
  [key: string]: unknown;
}

export interface TransferRowData {
  send: TransferSend;
  link?: TransferLink;
  type?: string;
  simplified_status?: string;
  source?: string;
  destination?: string;
  wrap?: { sender_address?: string; [key: string]: unknown };
  unwrap?: { recipient_address?: string; tx_hash_unwrap?: string; [key: string]: unknown };
  erc20_transfer?: { sender_address?: string; [key: string]: unknown };
  command?: { transactionHash?: string; [key: string]: unknown };
  axelar_transfer?: { txhash?: string; [key: string]: unknown };
  ibc_send?: { recv_txhash?: string; [key: string]: unknown };
  time_spent?: { total?: number; [key: string]: unknown };
  [key: string]: unknown;
}

export interface TransferSearchResult {
  data?: TransferRowData[];
  total?: number;
}

export interface TransferSearchResults {
  [key: string]: TransferSearchResult;
}

export interface TransferRowProps {
  d: TransferRowData;
  assets: Asset[] | null | undefined;
}

export interface TransferStatusCellProps {
  d: TransferRowData;
}

export interface TransferMethodCellProps {
  d: TransferRowData;
  symbol: string | undefined;
  image: string | undefined;
  assetData: Asset | undefined;
  assets: Asset[] | null | undefined;
}

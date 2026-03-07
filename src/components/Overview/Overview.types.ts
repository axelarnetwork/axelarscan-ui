export interface NetworkGraphDataItem {
  id: string;
  sourceChain: string;
  destinationChain: string;
  num_txs: number;
  volume?: number;
  [key: string]: unknown;
}

export interface SourceChainEntry {
  key: string;
  destination_chains?: DestinationChainEntry[];
  [key: string]: unknown;
}

export interface DestinationChainEntry {
  key: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

export interface TransferStatsEntry {
  source_chain: string;
  destination_chain: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

export interface OverviewData {
  GMPStatsByChains?: { source_chains?: SourceChainEntry[]; [key: string]: unknown };
  GMPStatsByContracts?: Record<string, unknown>;
  GMPTotalVolume?: number;
  transfersStats?: { data?: TransferStatsEntry[]; total?: number; [key: string]: unknown };
  transfersTotalVolume?: number;
  [key: string]: unknown;
}

// Shared types for Interchain components

export interface FilterParams {
  from?: number;
  transfersType?: string | string[];
  sourceChain?: string | string[];
  destinationChain?: string | string[];
  chain?: string | string[];
  asset?: string | string[];
  itsTokenAddress?: string | string[];
  contractMethod?: string | string[];
  contractAddress?: string | string[];
  assetType?: string | string[];
  fromTime?: number;
  toTime?: number;
  [key: string]: string | number | string[] | undefined;
}

export interface FilterOption {
  value?: string;
  title: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

export interface SourceChainData {
  key: string;
  destination_chains?: Array<{
    key: string;
    num_txs?: number;
    volume?: number;
  }>;
  num_txs?: number;
  volume?: number;
}

export interface TransferStatsItem {
  source_chain?: string;
  destination_chain?: string;
  num_txs?: number;
  volume?: number;
}

export interface ChainWithContracts {
  key: string;
  contracts?: ContractData[];
}

export interface ContractData {
  key: string;
  chain?: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

export interface TopDataItem {
  key?: string;
  num_txs?: number;
  volume?: number;
  express_execute?: number;
  confirm?: number;
  approve?: number;
  total?: number;
  chain?: string | string[];
  contracts?: ContractData[];
  [key: string]: unknown;
}

export interface ChartDataPoint {
  timestamp?: number;
  timeString?: string;
  focusTimeString?: string;
  num_txs?: number;
  volume?: number;
  gmp_num_txs?: number;
  gmp_volume?: number;
  transfers_num_txs?: number;
  transfers_volume?: number;
  transfers_airdrop_num_txs?: number;
  transfers_airdrop_volume?: number;
  transfers_airdrop_volume_value?: number;
  data?: ChartDataPoint[];
  [key: string]: number | string | undefined | ChartDataPoint[];
}

// Main InterchainData interface - represents the full API response
export interface InterchainData {
  // GMP Stats
  GMPStatsByChains?: {
    source_chains?: SourceChainData[];
    total?: number;
    chains?: ChainWithContracts[];
  };
  GMPStatsByContracts?: {
    chains?: ChainWithContracts[];
  };
  GMPChart?: {
    data?: ChartDataPoint[];
  };
  GMPTotalVolume?: number;
  GMPTopUsers?: {
    data?: TopDataItem[];
  };
  GMPTopITSUsers?: {
    data?: TopDataItem[];
  };
  GMPTopITSUsersByVolume?: {
    data?: TopDataItem[];
  };
  GMPTopITSAssets?: {
    data?: TopDataItem[];
  };
  GMPTopITSAssetsByVolume?: {
    data?: TopDataItem[];
  };
  GMPStatsAVGTimes?: {
    time_spents?: TimeSpentData[];
  };

  // Transfer Stats
  transfersStats?: {
    data?: TransferStatsItem[];
    total?: number;
  };
  transfersChart?: {
    data?: ChartDataPoint[];
  };
  transfersAirdropChart?: {
    data?: ChartDataPoint[];
  };
  transfersTotalVolume?: number;
  transfersTopUsers?: {
    data?: TopDataItem[];
  };
  transfersTopUsersByVolume?: {
    data?: TopDataItem[];
  };
}

// Type for data with dynamic properties (used for setData state)
export type DynamicInterchainData = Record<
  string,
  | InterchainData
  | GroupDataItem[]
  | ChartDataPoint[]
  | TimeSpentData
  | { data?: ChartDataPoint[] }
>;

export interface GroupDataItem {
  key?: string;
  chain?: string | string[];
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

export interface TimeSpentData {
  id: string;
  name: string;
  label?: string;
  value?: number;
  time_spent?: number;
  [key: string]: string | number | undefined;
}

export interface TVLContractData {
  is_custom?: boolean;
  price?: number;
  [key: string]: unknown;
}

export interface TVLItem {
  contract_data?: TVLContractData;
  [key: string]: unknown;
}

export interface TVLData {
  assetType?: string;
  asset?: string;
  total?: number;
  price?: number;
  value?: number;
  total_on_contracts?: number;
  total_on_tokens?: number;
  tvl?: Record<string, TVLItem>;
  [key: string]: unknown;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}


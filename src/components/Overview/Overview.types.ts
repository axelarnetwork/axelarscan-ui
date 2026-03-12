import type {
  Chain,
  Validator,
  InflationData,
  NetworkParameters,
} from '@/types';

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
  GMPStatsByChains?: {
    source_chains?: SourceChainEntry[];
    [key: string]: unknown;
  };
  GMPStatsByContracts?: Record<string, unknown>;
  GMPTotalVolume?: number;
  transfersStats?: {
    data?: TransferStatsEntry[];
    total?: number;
    [key: string]: unknown;
  };
  transfersTotalVolume?: number;
  [key: string]: unknown;
}

export interface NetworkGraphSectionProps {
  data: OverviewData;
  networkGraph: NetworkGraphDataItem[] | null;
  chainPairs: Record<string, unknown>[];
  setChainFocus: (chain: string | null) => void;
}

export interface SankeyTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export interface ConnectedChainsTagProps {
  count: number;
}

export interface MetricWithTooltipProps {
  tooltipContent: string;
  href: string;
  children: React.ReactNode;
}

export interface StakedMetricProps {
  bankSupplyAmount: string;
  bondedTokens: string;
}

export interface APRMetricProps {
  inflation: number;
  communityTax: number;
  bankSupplyAmount: string;
  bondedTokens: string;
}

export interface CrossChainActivityProps {
  data: OverviewData;
  chains: Chain[] | null | undefined;
}

export interface InflationMetricProps {
  inflation: number;
}

export interface BlockData {
  latest_block_height?: number;
  avg_block_time?: number;
}

export interface MetricsProps {
  initialBlockData?: BlockData | null;
  initialValidators?: Validator[] | null;
  initialInflationData?: InflationData | null;
  initialNetworkParameters?: NetworkParameters | null;
  symbol?: string;
}

export interface OverviewProps {
  data: OverviewData;
  chains: Chain[] | null;
  networkGraph: NetworkGraphDataItem[];
  chainPairs: Record<string, unknown>[];
  metricsData?: MetricsProps;
}

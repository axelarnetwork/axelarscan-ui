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

export interface InflationMetricProps {
  inflation: number;
}

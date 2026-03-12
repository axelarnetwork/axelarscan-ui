import type {
  MetricsProps,
  NetworkGraphDataItem,
  OverviewData,
} from '@/components/Overview/Overview.types';
import {
  buildChainPairs,
  buildNetworkGraphData,
} from '@/components/Overview/Overview.utils';
import {
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import { transfersStats, transfersTotalVolume } from '@/lib/api/token-transfer';
import { getRPCStatus } from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toNumber } from '@/lib/number';
import { fetchChains } from '@/lib/queries/chainQueries';
import {
  fetchInflationData,
  fetchNetworkParameters,
} from '@/lib/queries/networkQueries';
import { fetchValidators } from '@/lib/queries/validatorQueries';
import type {
  Chain,
  InflationData,
  NetworkParameters,
  Validator,
} from '@/types';

export interface OverviewPageData {
  data: OverviewData;
  chains: Chain[] | null;
  networkGraph: NetworkGraphDataItem[];
  chainPairs: Record<string, unknown>[];
  metricsData: MetricsProps;
}

export async function fetchOverviewData(): Promise<OverviewPageData> {
  const [
    [
      gmpStatsByChains,
      gmpStatsByContracts,
      gmpTotalVolume,
      transferStats,
      transferTotalVolume,
      chains,
    ],
    metricsSettled,
  ] = await Promise.all([
    Promise.all([
      GMPStatsByChains(),
      GMPStatsByContracts(),
      GMPTotalVolume(),
      transfersStats(),
      transfersTotalVolume(),
      fetchChains(),
    ]),
    // Metrics calls use allSettled so a failure doesn't block the page
    Promise.allSettled([
      fetchValidators(),
      fetchInflationData(),
      fetchNetworkParameters(),
      getRPCStatus({ avg_block_time: true }) as Promise<{
        latest_block_height?: number;
        avg_block_time?: number;
      } | null>,
    ]),
  ]);

  const [validators, inflationData, networkParameters, blockData] =
    metricsSettled.map(r => (r.status === 'fulfilled' ? r.value : null)) as [
      Validator[] | null,
      InflationData | null,
      NetworkParameters | null,
      { latest_block_height?: number; avg_block_time?: number } | null,
    ];

  const data: OverviewData = {
    GMPStatsByChains: { ...(gmpStatsByChains as Record<string, unknown>) },
    GMPStatsByContracts: {
      ...(gmpStatsByContracts as Record<string, unknown>),
    },
    GMPTotalVolume: toNumber(gmpTotalVolume),
    transfersStats: { ...(transferStats as Record<string, unknown>) },
    transfersTotalVolume: toNumber(transferTotalVolume),
  };

  const networkGraph = buildNetworkGraphData(data, chains);
  const chainPairs = buildChainPairs(data, null, chains);

  const symbol = (
    getChainData('axelarnet', chains)?.native_token as
      | { symbol?: string }
      | undefined
  )?.symbol;

  const metricsData: MetricsProps = {
    initialBlockData: blockData,
    initialValidators: validators,
    initialInflationData: inflationData,
    initialNetworkParameters: networkParameters,
    symbol,
  };

  return { data, chains, networkGraph, chainPairs, metricsData };
}

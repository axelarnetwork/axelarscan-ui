import type { Chain } from '@/types';
import type {
  OverviewData,
  NetworkGraphDataItem,
} from '@/components/Overview/Overview.types';
import {
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import { transfersStats, transfersTotalVolume } from '@/lib/api/token-transfer';
import { fetchChains } from '@/lib/queries/chainQueries';
import {
  buildNetworkGraphData,
  buildChainPairs,
} from '@/components/Overview/Overview.utils';
import { toNumber } from '@/lib/number';

export interface OverviewPageData {
  data: OverviewData;
  chains: Chain[] | null;
  networkGraph: NetworkGraphDataItem[];
  chainPairs: Record<string, unknown>[];
}

export async function fetchOverviewData(): Promise<OverviewPageData> {
  const [
    gmpStatsByChains,
    gmpStatsByContracts,
    gmpTotalVolume,
    transferStats,
    transferTotalVolume,
    chains,
  ] = await Promise.all([
    GMPStatsByChains(),
    GMPStatsByContracts(),
    GMPTotalVolume(),
    transfersStats(),
    transfersTotalVolume(),
    fetchChains(),
  ]);

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

  return { data, chains, networkGraph, chainPairs };
}

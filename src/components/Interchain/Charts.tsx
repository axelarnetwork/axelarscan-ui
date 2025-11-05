import _ from 'lodash';

import { useGlobalStore } from '@/components/Global';
import { toNumber } from '@/lib/number';
import { ChartsProps } from './Charts.types';
import {
  getChainPairs,
  getChartScaleAndStack,
  processChartData,
} from './Charts.utils';
import { SankeyChart } from './SankeyChart';
import { StatsBarChart } from './StatsBarChart';

export function Charts({ data, granularity }: ChartsProps) {
  const { chains } = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPTotalVolume,
    transfersStats,
    transfersTotalVolume,
  } = { ...data };

  const TIME_FORMAT = granularity === 'month' ? 'MMM' : 'D MMM';
  const chartData = processChartData(data);
  const { scale, useStack } = getChartScaleAndStack(chartData);
  const chainPairs = getChainPairs(data, chains);

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:px-2 xl:px-0">
        <StatsBarChart
          i={0}
          data={chartData}
          totalValue={
            toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
            toNumber(transfersStats?.total)
          }
          field="num_txs"
          title="Transactions"
          description={`Number of transactions by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
        />
        <StatsBarChart
          i={1}
          data={chartData}
          totalValue={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
          field="volume"
          stacks={['transfers_airdrop', 'gmp', 'transfers']}
          colors={
            scale === 'log' && useStack
              ? {
                  gmp: '#33b700',
                  transfers: '#33b700',
                  transfers_airdrop: '#33b700',
                }
              : undefined
          }
          scale={scale}
          useStack={useStack}
          title="Volume"
          description={`Transfer volume by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
          valuePrefix="$"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:px-2 xl:px-0">
        <SankeyChart
          i={0}
          data={chainPairs}
          totalValue={
            toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
            toNumber(transfersStats?.total)
          }
          field="num_txs"
          title="Transactions"
          description="Total transactions between chains"
        />
        <SankeyChart
          i={1}
          data={chainPairs}
          totalValue={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
          field="volume"
          title="Volume"
          description="Total volume between chains"
          valuePrefix="$"
        />
      </div>
    </div>
  );
}

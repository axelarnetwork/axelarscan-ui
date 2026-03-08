import { useMemo } from 'react';
import _ from 'lodash';

import { useChains } from '@/hooks/useGlobalData';
import { toNumber } from '@/lib/number';
import { SankeyChart } from '../SankeyChart';
import { StatsBarChart } from '../StatsBarChart';
import { chartsStyles } from './Charts.styles';
import { ChartsProps } from './Charts.types';
import { getChainPairs, getChartStack, processChartData } from './Charts.utils';

export function Charts({ data, granularity }: ChartsProps) {
  const chains = useChains();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPTotalVolume,
    transfersStats,
    transfersTotalVolume,
  } = data;

  const TIME_FORMAT = granularity === 'month' ? 'MMM' : 'D MMM';
  const chartData = processChartData(data);
  const { useStack } = getChartStack(chartData);
  const chainPairs = getChainPairs(data, chains);
  const totalTxs =
    toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
    toNumber(transfersStats?.total);
  const totalVolume = toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume);

  return (
    <div className={chartsStyles.container}>
      <div className={chartsStyles.grid}>
        <StatsBarChart
          i={0}
          data={chartData}
          totalValue={totalTxs}
          field="num_txs"
          title="Transactions"
          description={`Number of transactions by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
        />
        <StatsBarChart
          i={1}
          data={chartData}
          totalValue={totalVolume}
          field="volume"
          stacks={['transfers_airdrop', 'gmp', 'transfers']}
          useStack={useStack}
          title="Volume"
          description={`Transfer volume by ${granularity}`}
          dateFormat={TIME_FORMAT}
          granularity={granularity}
          valuePrefix="$"
        />
      </div>
      <div className={chartsStyles.grid}>
        <SankeyChart
          i={0}
          data={chainPairs}
          totalValue={totalTxs}
          field="num_txs"
          title="Transactions"
          description="Total transactions between chains"
        />
        <SankeyChart
          i={1}
          data={chainPairs}
          totalValue={totalVolume}
          field="volume"
          title="Volume"
          description="Total volume between chains"
          valuePrefix="$"
        />
      </div>
    </div>
  );
}

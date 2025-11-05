import _ from 'lodash';

import { useGlobalStore } from '@/components/Global';
import { toNumber } from '@/lib/number';
import { chartsColors, chartsStyles } from './Charts.styles';
import { ChartsProps } from './Charts.types';
import {
  getChainPairs,
  getChartScaleAndStack,
  processChartData,
} from './Charts.utils';
import { SankeyChart } from '../SankeyChart/SankeyChart';
import { StatsBarChart } from '../StatsBarChart/StatsBarChart';

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
    <div className={chartsStyles.container}>
      <div className={chartsStyles.grid}>
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
            scale === 'log' && useStack ? chartsColors.logScale : undefined
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
      <div className={chartsStyles.grid}>
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

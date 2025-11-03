import _ from 'lodash';

import { useGlobalStore } from '@/components/Global';
import { getChainData } from '@/lib/config';
import { toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { ChartsProps } from './Charts.types';
import {
  ChartDataPoint,
  GroupDataItem,
  SourceChainData,
  TransferStatsItem,
} from './Interchain.types';
import { SankeyChart } from './SankeyChart';
import { StatsBarChart } from './StatsBarChart';

export function Charts({ data, granularity }: ChartsProps) {
  const { chains } = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPChart,
    GMPTotalVolume,
    transfersStats,
    transfersChart,
    transfersAirdropChart,
    transfersTotalVolume,
  } = { ...data };

  const TIME_FORMAT = granularity === 'month' ? 'MMM' : 'D MMM';

  const chartData = _.orderBy(
    Object.entries(
      _.groupBy(
        _.concat(
          (toArray(GMPChart?.data as ChartDataPoint[]) as ChartDataPoint[]).map(
            (d: ChartDataPoint) => ({
              ...d,
              gmp_num_txs: d.num_txs,
              gmp_volume: d.volume,
            })
          ),
          (
            toArray(
              transfersChart?.data as ChartDataPoint[]
            ) as ChartDataPoint[]
          ).map((d: ChartDataPoint) => ({
            ...d,
            gmp_num_txs: undefined,
            gmp_volume: undefined,
            transfers_num_txs: d.num_txs,
            transfers_volume: d.volume,
          })),
          (
            toArray(
              transfersAirdropChart?.data as ChartDataPoint[]
            ) as ChartDataPoint[]
          ).map((d: ChartDataPoint) => ({
            ...d,
            gmp_num_txs: undefined,
            gmp_volume: undefined,
            transfers_airdrop_num_txs: d.num_txs,
            transfers_airdrop_volume: d.volume,
          }))
        ),
        'timestamp'
      )
    )
      .map(([k, v]) => ({
        timestamp: toNumber(k),
        num_txs: _.sumBy(v, 'num_txs'),
        volume: _.sumBy(v, 'volume'),
        gmp_num_txs: _.sumBy(
          v.filter(v => (v.gmp_num_txs || 0) > 0),
          'gmp_num_txs'
        ),
        gmp_volume: _.sumBy(
          v.filter(v => (v.gmp_volume || 0) > 0),
          'gmp_volume'
        ),
        transfers_num_txs: _.sumBy(
          v.filter(v => (v.transfers_num_txs || 0) > 0),
          'transfers_num_txs'
        ),
        transfers_volume: _.sumBy(
          v.filter(v => (v.transfers_volume || 0) > 0),
          'transfers_volume'
        ),
        transfers_airdrop_num_txs: _.sumBy(
          v.filter(v => (v.transfers_airdrop_num_txs || 0) > 0),
          'transfers_airdrop_num_txs'
        ),
        transfers_airdrop_volume: _.sumBy(
          v.filter(v => (v.transfers_airdrop_volume || 0) > 0),
          'transfers_airdrop_volume'
        ),
      }))
      .map(d => ({
        ...d,
        transfers_airdrop_volume_value:
          d.transfers_airdrop_volume > 0
            ? d.transfers_airdrop_volume > 100000
              ? _.mean([d.gmp_volume, d.transfers_volume]) * 2
              : d.transfers_airdrop_volume
            : 0,
      })),
    ['timestamp'],
    ['asc']
  );

  const maxVolumePerMean =
    (_.maxBy(chartData, 'volume')?.volume || 0) /
    (_.meanBy(chartData, 'volume') || 1);
  const hasAirdropActivities = chartData.find(
    d => d.transfers_airdrop_volume > 0
  )
    ? true
    : false;

  const scale =
    false && maxVolumePerMean > 5 && !hasAirdropActivities ? 'log' : undefined;
  const useStack =
    maxVolumePerMean <= 5 || maxVolumePerMean > 10 || hasAirdropActivities;

  const groupData = (data: GroupDataItem[], by = 'key') =>
    Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
      key: (v[0] as GroupDataItem)?.key || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === 'customKey'
                ? (v[0] as GroupDataItem)?.chain
                : (v as GroupDataItem[]).map((d: GroupDataItem) => d.chain)
            )
          ).map((d: string | string[] | undefined) =>
            getChainData(d as string, chains)
          )
        ),
        ['i'],
        ['asc']
      ).map(d => d.id),
    }));

  const chainPairs = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: `${s.key}_${d.key}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: `${d.source_chain}_${d.destination_chain}`,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

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

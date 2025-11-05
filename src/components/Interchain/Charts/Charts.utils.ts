import _ from 'lodash';

import { getChainData } from '@/lib/config';
import { toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import {
  ChartDataPoint,
  GroupDataItem,
  InterchainData,
  SourceChainData,
  TransferStatsItem,
} from '../Interchain.types';

export function processChartData(data: InterchainData): ChartDataPoint[] {
  const { GMPChart, transfersChart, transfersAirdropChart } = { ...data };

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

  return chartData;
}

export function groupData(
  data: GroupDataItem[],
  chains: string[],
  by = 'key'
): GroupDataItem[] {
  return Object.entries(_.groupBy(toArray(data) as GroupDataItem[], by)).map(
    ([k, v]) => ({
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
    })
  );
}

export function getChainPairs(
  data: InterchainData,
  chains: string[]
): GroupDataItem[] {
  const { GMPStatsByChains, transfersStats } = { ...data };

  const groupDataFn = (data: GroupDataItem[]) => groupData(data, chains);

  return groupDataFn(
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
}

export function getChartStack(chartData: ChartDataPoint[]): {
  useStack: boolean;
} {
  const maxVolumePerMean =
    (_.maxBy(chartData, 'volume')?.volume || 0) /
    (_.meanBy(chartData, 'volume') || 1);
  const hasAirdropActivities = chartData.some(
    d => (d.transfers_airdrop_volume || 0) > 0
  );

  const useStack =
    maxVolumePerMean <= 5 || maxVolumePerMean > 10 || hasAirdropActivities;

  return { useStack };
}

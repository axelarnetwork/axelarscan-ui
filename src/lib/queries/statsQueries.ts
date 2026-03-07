import moment from 'moment';

import {
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPChart,
  GMPTotalVolume,
  GMPTopUsers,
  GMPTopITSAssets,
} from '@/lib/api/gmp';
import {
  transfersStats,
  transfersChart,
  transfersTotalVolume,
  transfersTopUsers,
} from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { toArray } from '@/lib/parser';

const METRICS = [
  'GMPStatsByChains',
  'GMPStatsByContracts',
  'GMPChart',
  'GMPTotalVolume',
  'GMPTopUsers',
  'GMPTopITSUsers',
  'GMPTopITSUsersByVolume',
  'GMPTopITSAssets',
  'GMPTopITSAssetsByVolume',
  'transfersStats',
  'transfersChart',
  'transfersTotalVolume',
  'transfersTopUsers',
  'transfersTopUsersByVolume',
] as const;

const fetchMetric = async (metric: string): Promise<[string, unknown][]> => {
  switch (metric) {
    case 'GMPStatsByChains':
      return [[metric, await GMPStatsByChains()]];
    case 'GMPStatsByContracts':
      return [[metric, await GMPStatsByContracts()]];
    case 'GMPChart':
      return [[metric, await GMPChart({ granularity: 'month' })]];
    case 'GMPTotalVolume':
      return [[metric, await GMPTotalVolume()]];
    case 'GMPTopUsers':
      return [[metric, await GMPTopUsers({ size: 100 })]];
    case 'GMPTopITSUsers':
      return [[metric, await GMPTopUsers({ assetType: 'its', size: 100 })]];
    case 'GMPTopITSUsersByVolume':
      return [
        [metric, await GMPTopUsers({ assetType: 'its', orderBy: 'volume', size: 100 })],
      ];
    case 'GMPTopITSAssets':
      return [[metric, await GMPTopITSAssets({ size: 100 })]];
    case 'GMPTopITSAssetsByVolume':
      return [[metric, await GMPTopITSAssets({ orderBy: 'volume', size: 100 })]];
    case 'transfersStats':
      return [[metric, await transfersStats()]];
    case 'transfersChart':
      return fetchTransfersChart(metric);
    case 'transfersTotalVolume':
      return [[metric, await transfersTotalVolume()]];
    case 'transfersTopUsers':
      return [[metric, await transfersTopUsers({ size: 100 })]];
    case 'transfersTopUsersByVolume':
      return [[metric, await transfersTopUsers({ orderBy: 'volume', size: 100 })]];
    default:
      return [];
  }
};

const fetchTransfersChart = async (metric: string): Promise<[string, unknown][]> => {
  const value = (await transfersChart({ granularity: 'month' })) as Record<string, unknown> | null;
  const values: [string, unknown][] = [[metric, value]];

  if (!value?.data) return values;

  const airdrops = [
    {
      date: '08-01-2023',
      fromTime: undefined as number | undefined,
      toTime: undefined as number | undefined,
      chain: 'sei',
      environment: 'mainnet',
    },
  ];

  for (const airdrop of airdrops) {
    const { date, chain, environment } = airdrop;
    let { fromTime, toTime } = airdrop;

    if (!fromTime) {
      fromTime = moment(date, 'MM-DD-YYYY').startOf('month').unix();
    }
    if (!toTime) {
      toTime = moment(date, 'MM-DD-YYYY').endOf('month').unix();
    }

    if (environment === ENVIRONMENT) {
      const response = (await transfersChart({
        chain,
        fromTime,
        toTime,
        granularity: 'month',
      })) as Record<string, unknown> | null;

      const responseData = response?.data as Record<string, unknown>[] | undefined;
      const valueData = value!.data as Record<string, unknown>[];
      if (toArray(responseData).length > 0) {
        for (const v of responseData!) {
          if (v.timestamp && (v.volume as number) > 0) {
            const i = valueData.findIndex(
              (d: Record<string, unknown>) => d.timestamp === v.timestamp
            );
            if (i > -1 && (valueData[i].volume as number) >= (v.volume as number)) {
              valueData[i] = {
                ...valueData[i],
                volume: (valueData[i].volume as number) - (v.volume as number),
              };
            }
          }
        }
        values.push([
          metric.replace('transfers', 'transfersAirdrop'),
          response,
        ]);
      }
    }
  }

  return values;
};

export const fetchStats = async (): Promise<Record<string, unknown> | null> => {
  const results = await Promise.all(METRICS.map(fetchMetric));
  return Object.fromEntries(results.flatMap((d) => d));
};

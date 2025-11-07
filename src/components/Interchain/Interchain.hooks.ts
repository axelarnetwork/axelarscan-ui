import _ from 'lodash';
import moment from 'moment';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import {
  GMPChart,
  GMPStatsAVGTimes,
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTopITSAssets,
  GMPTopUsers,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import {
  transfersChart,
  transfersStats,
  transfersTopUsers,
  transfersTotalVolume,
} from '@/lib/api/token-transfer';
import { ENVIRONMENT, getAssetData, getITSAssetData } from '@/lib/config';
import { toNumber } from '@/lib/number';
import { generateKeyByParams, getParams } from '@/lib/operator';
import { toArray } from '@/lib/parser';
import { toBoolean } from '@/lib/string';
import {
  ChartDataPoint,
  DynamicInterchainData,
  FilterParams,
} from './Interchain.types';

interface UseInterchainHooksParams {
  searchParams: ReadonlyURLSearchParams;
  params: FilterParams;
  setParams: (params: FilterParams) => void;
  types: string[] | string;
  setTypes: (types: string[] | string) => void;
  setData: (
    updater: (prevData: DynamicInterchainData | null) => DynamicInterchainData
  ) => void;
  setTimeSpentData: (
    updater: (prevData: DynamicInterchainData | null) => DynamicInterchainData
  ) => void;
  refresh: boolean | null;
  setRefresh: (refresh: boolean | null) => void;
  assets: unknown;
  stats: Record<string, unknown> | null;
  itsAssets: unknown;
  granularity: 'day' | 'week' | 'month';
}

const INTERCHAIN_METRICS = [
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

// Helper functions for metric fetching

function checkIfSearchingITSOnTransfers(
  metricName: string,
  types: string[] | string,
  currentParams: FilterParams,
  itsAssets: unknown
): boolean {
  return (
    types.includes('transfers') &&
    metricName.startsWith('transfers') &&
    (currentParams.assetType === 'its' ||
      toArray(currentParams.asset).findIndex(assetName =>
        getITSAssetData(assetName, itsAssets)
      ) > -1)
  );
}

function checkIfHasITS(
  types: string[] | string,
  currentParams: FilterParams,
  assets: unknown
): boolean {
  return (
    types.includes('gmp') &&
    currentParams.assetType !== 'gateway' &&
    toArray(currentParams.asset).findIndex(assetName =>
      getAssetData(assetName, assets)
    ) < 0
  );
}

function checkIfHasNoFilters(currentParams: FilterParams): boolean {
  return Object.keys(currentParams).length === 0;
}

function getCachedOrFetch<T>(
  hasNoFilters: boolean,
  stats: Record<string, unknown> | null,
  metricName: string,
  fetchFn: () => Promise<T>
): Promise<T | false> {
  if (hasNoFilters && stats?.[metricName]) {
    return Promise.resolve(stats[metricName] as T);
  }
  return fetchFn();
}

async function fetchGMPMetric(
  metricName: string,
  currentParams: FilterParams,
  types: string[] | string,
  hasNoFilters: boolean,
  stats: Record<string, unknown> | null,
  granularity?: 'day' | 'week' | 'month'
): Promise<[string, unknown]> {
  if (metricName === 'GMPStatsByChains') {
    return [
      metricName,
      types.includes('gmp') &&
        (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
          GMPStatsByChains(currentParams)
        )),
    ];
  }
  if (metricName === 'GMPStatsByContracts') {
    return [
      metricName,
      types.includes('gmp') &&
        (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
          GMPStatsByContracts(currentParams)
        )),
    ];
  }
  if (metricName === 'GMPStatsAVGTimes') {
    return [
      metricName,
      types.includes('gmp') &&
        (await GMPStatsAVGTimes({
          ...currentParams,
          fromTime:
            currentParams.fromTime !== undefined
              ? currentParams.fromTime
              : moment().subtract(1, 'months').startOf('day').unix(),
        })),
    ];
  }
  if (metricName === 'GMPChart') {
    return [
      metricName,
      types.includes('gmp') &&
        (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
          GMPChart({ ...currentParams, granularity: granularity! })
        )),
    ];
  }
  if (metricName === 'GMPTotalVolume') {
    return [
      metricName,
      types.includes('gmp') &&
        (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
          GMPTotalVolume(currentParams)
        )),
    ];
  }
  if (metricName === 'GMPTopUsers') {
    return [
      metricName,
      types.includes('gmp') &&
        (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
          GMPTopUsers({ ...currentParams, size: 100 })
        )),
    ];
  }

  return [metricName, undefined];
}

async function fetchGMPITSMetric(
  metricName: string,
  currentParams: FilterParams,
  hasITS: boolean,
  hasNoFilters: boolean,
  stats: Record<string, unknown> | null
): Promise<[string, unknown]> {
  if (!hasITS) {
    return [metricName, undefined];
  }

  if (metricName === 'GMPTopITSUsers') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        GMPTopUsers({
          ...currentParams,
          assetType: 'its',
          size: 100,
        })
      )) || false,
    ];
  }
  if (metricName === 'GMPTopITSUsersByVolume') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        GMPTopUsers({
          ...currentParams,
          assetType: 'its',
          orderBy: 'volume',
          size: 100,
        })
      )) || false,
    ];
  }
  if (metricName === 'GMPTopITSAssets') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        GMPTopITSAssets({ ...currentParams, size: 100 })
      )) || false,
    ];
  }
  if (metricName === 'GMPTopITSAssetsByVolume') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        GMPTopITSAssets({
          ...currentParams,
          orderBy: 'volume',
          size: 100,
        })
      )) || false,
    ];
  }

  return [metricName, undefined];
}

async function processAirdropData(
  airdrop: {
    date: string;
    fromTime?: number;
    toTime?: number;
    chain: string;
    environment: string;
  },
  currentParams: FilterParams,
  granularity: 'day' | 'week' | 'month',
  chartValue: { data: ChartDataPoint[] },
  metricName: string
): Promise<[string, unknown] | null> {
  const { date, chain, environment } = airdrop;
  const airdropFromTime: number =
    airdrop.fromTime ?? moment(date, 'MM-DD-YYYY').startOf('month').unix();
  const airdropToTime: number =
    airdrop.toTime ?? moment(date, 'MM-DD-YYYY').endOf('month').unix();

  if (
    environment !== ENVIRONMENT ||
    (currentParams.fromTime &&
      toNumber(currentParams.fromTime) >= airdropFromTime) ||
    (currentParams.toTime && toNumber(currentParams.toTime) <= airdropToTime)
  ) {
    return null;
  }

  const airdropResponse = await transfersChart({
    ...currentParams,
    chain,
    fromTime: airdropFromTime,
    toTime: airdropToTime,
    granularity,
  });

  if (toArray(airdropResponse?.data).length === 0) {
    return null;
  }

  // Adjust chart data by subtracting airdrop volumes
  for (const airdropPoint of toArray(
    airdropResponse.data
  ) as ChartDataPoint[]) {
    if (airdropPoint.timestamp && (airdropPoint.volume || 0) > 0) {
      const matchingIndex = chartValue.data.findIndex(
        (point: Record<string, unknown>) =>
          point.timestamp === airdropPoint.timestamp
      );

      if (
        matchingIndex > -1 &&
        (chartValue.data[matchingIndex].volume || 0) >=
          (airdropPoint.volume || 0)
      ) {
        chartValue.data[matchingIndex] = {
          ...chartValue.data[matchingIndex],
          volume:
            (chartValue.data[matchingIndex].volume || 0) -
            (airdropPoint.volume || 0),
        };
      }
    }
  }

  return [metricName.replace('transfers', 'transfersAirdrop'), airdropResponse];
}

async function fetchTransfersChart(
  metricName: string,
  currentParams: FilterParams,
  types: string[] | string,
  hasNoFilters: boolean,
  stats: Record<string, unknown> | null,
  granularity: 'day' | 'week' | 'month'
): Promise<[string, unknown] | [string, unknown][]> {
  if (hasNoFilters && stats?.[metricName]) {
    // Return both original and airdrop data for cached stats
    return [
      [metricName, stats[metricName]],
      [
        metricName.replace('transfers', 'transfersAirdrop'),
        stats[metricName.replace('transfers', 'transfersAirdrop')],
      ],
    ] as [string, unknown][];
  }

  if (!types.includes('transfers')) {
    return [metricName, false];
  }

  let chartValue = await transfersChart({
    ...currentParams,
    granularity,
  });

  if (!chartValue?.data || granularity !== 'month') {
    return [metricName, chartValue];
  }

  const chartValues: [string, unknown][] = [[metricName, chartValue]];

  const airdrops = [
    {
      date: '08-01-2023',
      fromTime: undefined,
      toTime: undefined,
      chain: 'sei',
      environment: 'mainnet',
    },
  ];

  // Process airdrop data
  for (const airdrop of airdrops) {
    const airdropResult = await processAirdropData(
      airdrop,
      currentParams,
      granularity,
      chartValue,
      metricName
    );
    if (airdropResult) {
      chartValues.push(airdropResult);
    }
  }

  return chartValues as [string, unknown];
}

async function fetchTransfersMetric(
  metricName: string,
  currentParams: FilterParams,
  types: string[] | string,
  isSearchITSOnTransfers: boolean,
  hasNoFilters: boolean,
  stats: Record<string, unknown> | null,
  granularity: 'day' | 'week' | 'month'
): Promise<[string, unknown] | [string, unknown][]> {
  if (isSearchITSOnTransfers) {
    const emptyValue = metricName === 'transfersTotalVolume' ? 0 : { data: [] };
    return [metricName, emptyValue];
  }

  if (!types.includes('transfers')) {
    return [metricName, false];
  }

  if (metricName === 'transfersStats') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        transfersStats(currentParams)
      )) || false,
    ];
  }
  if (metricName === 'transfersChart') {
    return fetchTransfersChart(
      metricName,
      currentParams,
      types,
      hasNoFilters,
      stats,
      granularity
    );
  }
  if (metricName === 'transfersTotalVolume') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        transfersTotalVolume(currentParams)
      )) || false,
    ];
  }
  if (metricName === 'transfersTopUsers') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        transfersTopUsers({ ...currentParams, size: 100 })
      )) || false,
    ];
  }
  if (metricName === 'transfersTopUsersByVolume') {
    return [
      metricName,
      (await getCachedOrFetch(hasNoFilters, stats, metricName, () =>
        transfersTopUsers({
          ...currentParams,
          orderBy: 'volume',
          size: 100,
        })
      )) || false,
    ];
  }

  return [metricName, undefined];
}

async function fetchMetricData(
  metricName: string,
  currentParams: FilterParams,
  types: string[] | string,
  stats: Record<string, unknown> | null,
  assets: unknown,
  itsAssets: unknown,
  granularity: 'day' | 'week' | 'month'
): Promise<[string, unknown] | [string, unknown][]> {
  const isSearchITSOnTransfers = checkIfSearchingITSOnTransfers(
    metricName,
    types,
    currentParams,
    itsAssets
  );
  const hasITS = checkIfHasITS(types, currentParams, assets);
  const hasNoFilters = checkIfHasNoFilters(currentParams);

  // Handle GMP metrics
  if (metricName.startsWith('GMP')) {
    if (
      metricName === 'GMPTopITSUsers' ||
      metricName === 'GMPTopITSUsersByVolume' ||
      metricName === 'GMPTopITSAssets' ||
      metricName === 'GMPTopITSAssetsByVolume'
    ) {
      return fetchGMPITSMetric(
        metricName,
        currentParams,
        hasITS,
        hasNoFilters,
        stats
      );
    }
    return fetchGMPMetric(
      metricName,
      currentParams,
      types,
      hasNoFilters,
      stats,
      granularity
    );
  }

  // Handle transfers metrics
  if (metricName.startsWith('transfers')) {
    return fetchTransfersMetric(
      metricName,
      currentParams,
      types,
      isSearchITSOnTransfers,
      hasNoFilters,
      stats,
      granularity
    );
  }

  return [metricName, undefined];
}

export function useInterchainFilters(params: UseInterchainHooksParams) {
  const {
    searchParams,
    params: currentParams,
    setParams,
    setTypes,
    setRefresh,
  } = params;

  useEffect(() => {
    const newParams = getParams(searchParams) as FilterParams;

    if (!_.isEqual(newParams, currentParams)) {
      setParams(newParams);

      if (newParams.contractMethod) {
        setTypes(['gmp']);
      } else {
        setTypes(newParams.transfersType || ['gmp', 'transfers']);
      }

      setRefresh(true);
    }
  }, [searchParams, currentParams, setParams, setTypes, setRefresh]);
}

export function useInterchainData(params: UseInterchainHooksParams) {
  const {
    params: currentParams,
    types,
    setData,
    setRefresh,
    assets,
    stats,
    itsAssets,
    granularity,
    refresh,
  } = params;

  useEffect(() => {
    const fetchInterchainData = async () => {
      // Early return if conditions aren't met
      if (
        !currentParams ||
        !toBoolean(refresh) ||
        !stats ||
        (currentParams.asset && (!assets || !itsAssets))
      ) {
        return;
      }

      const fetchedData = Object.fromEntries(
        await Promise.all(
          (toArray(INTERCHAIN_METRICS) as string[]).map(async metricName => {
            const result = await fetchMetricData(
              metricName,
              currentParams,
              types,
              stats,
              assets,
              itsAssets,
              granularity
            );
            return result;
          })
        ).then((results: ([string, unknown] | [string, unknown][])[]) =>
          results
            .filter(result => result !== null && result !== undefined)
            .map(result => (Array.isArray(result[0]) ? result : [result]))
            .flatMap(result => result as [string, unknown][])
        )
      );

      setData(prevData => ({
        ...prevData,
        [generateKeyByParams(currentParams)]: fetchedData,
      }));
      setRefresh(false);
    };

    fetchInterchainData();
  }, [
    currentParams,
    refresh,
    setRefresh,
    assets,
    stats,
    itsAssets,
    types,
    granularity,
    setData,
  ]);
}

export function useInterchainTimeSpent(params: UseInterchainHooksParams) {
  const {
    params: currentParams,
    types,
    setTimeSpentData,
    refresh,
    setRefresh,
  } = params;

  useEffect(() => {
    const fetchTimeSpentData = async () => {
      // Early return if conditions aren't met
      if (!currentParams || !toBoolean(refresh) || !types.includes('gmp')) {
        return;
      }

      const timeSpentData = {
        GMPStatsAVGTimes: await GMPStatsAVGTimes({
          ...currentParams,
          fromTime:
            currentParams.fromTime ||
            moment().subtract(3, 'months').startOf('day').unix(),
        }),
      };

      setTimeSpentData(prevData => ({
        ...prevData,
        [generateKeyByParams(currentParams)]: timeSpentData,
      }));
    };

    fetchTimeSpentData();
  }, [currentParams, setTimeSpentData, refresh, setRefresh, types]);
}

export function useInterchainAutoRefresh(params: UseInterchainHooksParams) {
  const { setRefresh } = params;

  useEffect(() => {
    const interval = setInterval(() => setRefresh(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setRefresh]);
}

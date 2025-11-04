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
      // assets data require when filtering asset
      if (
        currentParams &&
        toBoolean(refresh) &&
        stats &&
        (!currentParams.asset || (assets && itsAssets))
      ) {
        const fetchedData = Object.fromEntries(
          await Promise.all(
            (toArray(INTERCHAIN_METRICS) as string[]).map(
              (metricName: string) =>
                new Promise<[string, unknown]>(async resolve => {
                  const isSearchITSOnTransfers =
                    types.includes('transfers') &&
                    metricName.startsWith('transfers') &&
                    (currentParams.assetType === 'its' ||
                      toArray(currentParams.asset).findIndex(assetName =>
                        getITSAssetData(assetName, itsAssets)
                      ) > -1);
                  const hasITS =
                    types.includes('gmp') &&
                    currentParams.assetType !== 'gateway' &&
                    toArray(currentParams.asset).findIndex(assetName =>
                      getAssetData(assetName, assets)
                    ) < 0;
                  const hasNoFilters = Object.keys(currentParams).length === 0;

                  switch (metricName) {
                    case 'GMPStatsByChains':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPStatsByChains(currentParams))),
                      ]);
                      break;
                    case 'GMPStatsByContracts':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPStatsByContracts(currentParams))),
                      ]);
                      break;
                    case 'GMPStatsAVGTimes':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          (await GMPStatsAVGTimes({
                            ...currentParams,
                            fromTime:
                              currentParams.fromTime !== undefined
                                ? currentParams.fromTime
                                : moment()
                                    .subtract(1, 'months')
                                    .startOf('day')
                                    .unix(),
                          })),
                      ]);
                      break;
                    case 'GMPChart':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPChart({
                              ...currentParams,
                              granularity,
                            }))),
                      ]);
                      break;
                    case 'GMPTotalVolume':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTotalVolume(currentParams))),
                      ]);
                      break;
                    case 'GMPTopUsers':
                      resolve([
                        metricName,
                        types.includes('gmp') &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTopUsers({
                              ...currentParams,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsers':
                      resolve([
                        metricName,
                        hasITS &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTopUsers({
                              ...currentParams,
                              assetType: 'its',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsersByVolume':
                      resolve([
                        metricName,
                        hasITS &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTopUsers({
                              ...currentParams,
                              assetType: 'its',
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssets':
                      resolve([
                        metricName,
                        hasITS &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTopITSAssets({
                              ...currentParams,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssetsByVolume':
                      resolve([
                        metricName,
                        hasITS &&
                          ((hasNoFilters && stats[metricName]) ||
                            (await GMPTopITSAssets({
                              ...currentParams,
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'transfersStats':
                      if (isSearchITSOnTransfers) {
                        resolve([metricName, { data: [] }]);
                      } else {
                        resolve([
                          metricName,
                          types.includes('transfers') &&
                            ((hasNoFilters && stats[metricName]) ||
                              (await transfersStats(currentParams))),
                        ]);
                      }
                      break;
                    case 'transfersChart':
                      if (isSearchITSOnTransfers) {
                        resolve([metricName, { data: [] }]);
                      } else {
                        if (hasNoFilters && stats[metricName]) {
                          // For noFilter case with cached stats, return both original and airdrop data
                          resolve([
                            [metricName, stats[metricName]],
                            [
                              metricName.replace(
                                'transfers',
                                'transfersAirdrop'
                              ),
                              stats[
                                metricName.replace(
                                  'transfers',
                                  'transfersAirdrop'
                                )
                              ],
                            ],
                          ] as unknown as [string, unknown]);
                        } else {
                          let chartValue =
                            types.includes('transfers') &&
                            (await transfersChart({
                              ...currentParams,
                              granularity,
                            }));

                          const chartValues = [[metricName, chartValue]];

                          if (chartValue?.data && granularity === 'month') {
                            const airdrops = [
                              {
                                date: '08-01-2023',
                                fromTime: undefined,
                                toTime: undefined,
                                chain: 'sei',
                                environment: 'mainnet',
                              },
                            ];

                            // custom transfers chart by adding airdrops data
                            for (const airdrop of airdrops) {
                              const { date, chain, environment } = {
                                ...airdrop,
                              };
                              let airdropFromTime: number =
                                airdrop.fromTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .startOf('month')
                                  .unix();
                              let airdropToTime: number =
                                airdrop.toTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .endOf('month')
                                  .unix();

                              if (
                                environment === ENVIRONMENT &&
                                (!currentParams.fromTime ||
                                  toNumber(currentParams.fromTime) <
                                    airdropFromTime) &&
                                (!currentParams.toTime ||
                                  toNumber(currentParams.toTime) >
                                    airdropToTime)
                              ) {
                                const airdropResponse = await transfersChart({
                                  ...currentParams,
                                  chain,
                                  fromTime: airdropFromTime!,
                                  toTime: airdropToTime!,
                                  granularity,
                                });

                                if (toArray(airdropResponse?.data).length > 0) {
                                  for (const airdropPoint of toArray(
                                    airdropResponse.data
                                  ) as ChartDataPoint[]) {
                                    if (
                                      airdropPoint.timestamp &&
                                      (airdropPoint.volume || 0) > 0
                                    ) {
                                      const matchingIndex =
                                        chartValue.data.findIndex(
                                          (point: Record<string, unknown>) =>
                                            point.timestamp ===
                                            airdropPoint.timestamp
                                        );

                                      if (
                                        matchingIndex > -1 &&
                                        (chartValue.data[matchingIndex]
                                          .volume || 0) >=
                                          (airdropPoint.volume || 0)
                                      ) {
                                        chartValue.data[matchingIndex] = {
                                          ...chartValue.data[matchingIndex],
                                          volume:
                                            (chartValue.data[matchingIndex]
                                              .volume || 0) -
                                            (airdropPoint.volume || 0),
                                        };
                                      }
                                    }
                                  }

                                  chartValues.push([
                                    metricName.replace(
                                      'transfers',
                                      'transfersAirdrop'
                                    ),
                                    airdropResponse,
                                  ]);
                                }
                              }
                            }
                          }

                          resolve(chartValues as [string, unknown]);
                        }
                      }
                      break;
                    case 'transfersTotalVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([metricName, 0]);
                      } else {
                        resolve([
                          metricName,
                          types.includes('transfers') &&
                            ((hasNoFilters && stats[metricName]) ||
                              (await transfersTotalVolume(currentParams))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsers':
                      if (isSearchITSOnTransfers) {
                        resolve([metricName, { data: [] }]);
                      } else {
                        resolve([
                          metricName,
                          types.includes('transfers') &&
                            ((hasNoFilters && stats[metricName]) ||
                              (await transfersTopUsers({
                                ...currentParams,
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsersByVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([metricName, { data: [] }]);
                      } else {
                        resolve([
                          metricName,
                          types.includes('transfers') &&
                            ((hasNoFilters && stats[metricName]) ||
                              (await transfersTopUsers({
                                ...currentParams,
                                orderBy: 'volume',
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    default:
                      resolve([metricName, undefined]);
                      break;
                  }
                })
            )
          ).then((results: [string, unknown][]) =>
            results
              .filter(
                (result: unknown) => result !== null && result !== undefined
              )
              .map((result: unknown) =>
                Array.isArray((result as [string, unknown][])[0])
                  ? result
                  : [result]
              )
              .flatMap((result: unknown) => result as [string, unknown][])
          )
        );

        setData(prevData => ({
          ...prevData,
          [generateKeyByParams(currentParams)]: fetchedData,
        }));
        setRefresh(false);
      }
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
      if (currentParams && toBoolean(refresh)) {
        const timeSpentData = {
          GMPStatsAVGTimes:
            types.includes('gmp') &&
            (await GMPStatsAVGTimes({
              ...currentParams,
              fromTime:
                currentParams.fromTime ||
                moment().subtract(3, 'months').startOf('day').unix(),
            })),
        };

        setTimeSpentData(prevData => ({
          ...prevData,
          [generateKeyByParams(currentParams)]: timeSpentData,
        }));
      }
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

'use client';

import clsx from 'clsx';
import _ from 'lodash';
import moment from 'moment';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdOutlineRefresh } from 'react-icons/md';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useGlobalStore } from '@/components/Global';
import { Overlay } from '@/components/Overlay';
import { Profile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import accounts from '@/data/accounts';
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
import { generateKeyByParams, getParams, getQueryString } from '@/lib/operator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, toBoolean } from '@/lib/string';
import { timeDiff } from '@/lib/time';

// Import types and components
import { Charts } from './Charts';
import { Filters } from './Filters';
import { GMPTimeSpents } from './GMPTimeSpents';
import {
  ChartDataPoint,
  DynamicInterchainData,
  FilterParams,
  InterchainData,
} from './Interchain.types';
import { Summary } from './Summary';
import { Tops } from './Tops';

const getGranularity = (fromTimestamp: number, toTimestamp: number) => {
  if (!fromTimestamp) return 'month';

  const diff = timeDiff(
    moment(fromTimestamp * 1000),
    'days',
    moment(toTimestamp * 1000)
  );

  if (diff >= 180) {
    return 'month';
  } else if (diff >= 60) {
    return 'week';
  }

  return 'day';
};

const TIME_SHORTCUTS = [
  {
    label: 'Last 7 days',
    value: [moment().subtract(7, 'days').startOf('day'), moment().endOf('day')],
  },
  {
    label: 'Last 30 days',
    value: [
      moment().subtract(30, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  {
    label: 'Last 365 days',
    value: [
      moment().subtract(365, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  { label: 'All-time', value: [] },
];

export function Interchain() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<FilterParams>(
    getParams(searchParams) as FilterParams
  );
  const [types, setTypes] = useState<string[] | string>(
    params.transfersType || ['gmp', 'transfers']
  );
  const [data, setData] = useState<DynamicInterchainData | null>(null);
  const [timeSpentData, setTimeSpentData] =
    useState<DynamicInterchainData | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const globalStore = useGlobalStore();
  const { assets, stats } = { ...globalStore };

  const {
    transfersType: _transfersType,
    contractMethod,
    contractAddress,
    fromTime,
    toTime,
  } = {
    ...params,
  };

  const granularity = getGranularity(fromTime || 0, toTime || 0);

  useEffect(() => {
    const _params = getParams(searchParams) as FilterParams;

    if (!_.isEqual(_params, params)) {
      setParams(_params);

      if (_params.contractMethod) {
        setTypes(['gmp']);
      } else {
        setTypes(_params.transfersType || ['gmp', 'transfers']);
      }

      setRefresh(true);
    }
  }, [searchParams, params]);

  useEffect(() => {
    const metrics = [
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
    ];

    const getData = async () => {
      // assets data require when filtering asset
      if (
        params &&
        toBoolean(refresh) &&
        stats &&
        (!params.asset || (assets && globalStore.itsAssets))
      ) {
        const newData = Object.fromEntries(
          await Promise.all(
            toArray(metrics).map(
              (d: string) =>
                new Promise<[string, unknown]>(async resolve => {
                  const isSearchITSOnTransfers =
                    types.includes('transfers') &&
                    d.startsWith('transfers') &&
                    (params.assetType === 'its' ||
                      toArray(params.asset).findIndex(a =>
                        getITSAssetData(a, globalStore.itsAssets)
                      ) > -1);
                  const hasITS =
                    types.includes('gmp') &&
                    params.assetType !== 'gateway' &&
                    toArray(params.asset).findIndex(a =>
                      getAssetData(a, assets)
                    ) < 0;
                  const noFilter = Object.keys(params).length === 0;

                  switch (d) {
                    case 'GMPStatsByChains':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPStatsByChains(params))),
                      ]);
                      break;
                    case 'GMPStatsByContracts':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPStatsByContracts(params))),
                      ]);
                      break;
                    case 'GMPStatsAVGTimes':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          (await GMPStatsAVGTimes({
                            ...params,
                            fromTime:
                              params.fromTime !== undefined
                                ? params.fromTime
                                : moment()
                                    .subtract(1, 'months')
                                    .startOf('day')
                                    .unix(),
                          })),
                      ]);
                      break;
                    case 'GMPChart':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPChart({
                              ...params,
                              granularity,
                            }))),
                      ]);
                      break;
                    case 'GMPTotalVolume':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPTotalVolume(params))),
                      ]);
                      break;
                    case 'GMPTopUsers':
                      resolve([
                        d,
                        types.includes('gmp') &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsers':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              assetType: 'its',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSUsersByVolume':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopUsers({
                              ...params,
                              assetType: 'its',
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssets':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopITSAssets({
                              ...params,
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'GMPTopITSAssetsByVolume':
                      resolve([
                        d,
                        hasITS &&
                          ((noFilter && stats[d]) ||
                            (await GMPTopITSAssets({
                              ...params,
                              orderBy: 'volume',
                              size: 100,
                            }))),
                      ]);
                      break;
                    case 'transfersStats':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersStats(params))),
                        ]);
                      }
                      break;
                    case 'transfersChart':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        if (noFilter && stats[d]) {
                          // For noFilter case with cached stats, return both original and airdrop data
                          resolve([
                            [d, stats[d]],
                            [
                              d.replace('transfers', 'transfersAirdrop'),
                              stats[d.replace('transfers', 'transfersAirdrop')],
                            ],
                          ] as unknown as [string, unknown]);
                        } else {
                          let value =
                            types.includes('transfers') &&
                            (await transfersChart({
                              ...params,
                              granularity,
                            }));

                          const values = [[d, value]];

                          if (value?.data && granularity === 'month') {
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
                              let fromTime: number =
                                airdrop.fromTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .startOf('month')
                                  .unix();
                              let toTime: number =
                                airdrop.toTime ??
                                moment(date, 'MM-DD-YYYY')
                                  .endOf('month')
                                  .unix();

                              if (
                                environment === ENVIRONMENT &&
                                (!params.fromTime ||
                                  toNumber(params.fromTime) < fromTime) &&
                                (!params.toTime ||
                                  toNumber(params.toTime) > toTime)
                              ) {
                                const response = await transfersChart({
                                  ...params,
                                  chain,
                                  fromTime: fromTime!,
                                  toTime: toTime!,
                                  granularity,
                                });

                                if (toArray(response?.data).length > 0) {
                                  for (const v of toArray(
                                    response.data
                                  ) as ChartDataPoint[]) {
                                    if (v.timestamp && (v.volume || 0) > 0) {
                                      const i = value.data.findIndex(
                                        (vData: Record<string, unknown>) =>
                                          vData.timestamp === v.timestamp
                                      );

                                      if (
                                        i > -1 &&
                                        (value.data[i].volume || 0) >=
                                          (v.volume || 0)
                                      ) {
                                        value.data[i] = {
                                          ...value.data[i],
                                          volume:
                                            (value.data[i].volume || 0) -
                                            (v.volume || 0),
                                        };
                                      }
                                    }
                                  }

                                  values.push([
                                    d.replace('transfers', 'transfersAirdrop'),
                                    response,
                                  ]);
                                }
                              }
                            }
                          }

                          resolve(values as [string, unknown]);
                        }
                      }
                      break;
                    case 'transfersTotalVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([d, 0]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTotalVolume(params))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsers':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTopUsers({
                                ...params,
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    case 'transfersTopUsersByVolume':
                      if (isSearchITSOnTransfers) {
                        resolve([d, { data: [] }]);
                      } else {
                        resolve([
                          d,
                          types.includes('transfers') &&
                            ((noFilter && stats[d]) ||
                              (await transfersTopUsers({
                                ...params,
                                orderBy: 'volume',
                                size: 100,
                              }))),
                        ]);
                      }
                      break;
                    default:
                      resolve([d, undefined]);
                      break;
                  }
                })
            )
          ).then((results: [string, unknown][]) =>
            results
              .filter((d: unknown) => d !== null && d !== undefined)
              .map((d: unknown) =>
                Array.isArray((d as [string, unknown][])[0]) ? d : [d]
              )
              .flatMap((d: unknown) => d as [string, unknown][])
          )
        );

        setData(prevData => ({
          ...prevData,
          [generateKeyByParams(params)]: newData,
        }));
        setRefresh(false);
      }
    };

    getData();
  }, [
    params,
    refresh,
    setRefresh,
    assets,
    stats,
    globalStore.itsAssets,
    types,
    granularity,
  ]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const newData = {
          GMPStatsAVGTimes:
            types.includes('gmp') &&
            (await GMPStatsAVGTimes({
              ...params,
              fromTime:
                params.fromTime ||
                moment().subtract(3, 'months').startOf('day').unix(),
            })),
        };

        setTimeSpentData(prevData => ({
          ...prevData,
          [generateKeyByParams(params)]: newData,
        }));
      }
    };

    getData();
  }, [params, setTimeSpentData, refresh, setRefresh, types]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div className="flex flex-col gap-y-6">
          <div className="flex items-center gap-x-6">
            <div className="sm:flex-auto">
              <div className="flex items-center gap-x-4">
                <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                  Statistics
                </h1>
                {_.slice(toArray(contractAddress), 0, 1).map((a, i) => (
                  <Profile
                    key={i}
                    i={i}
                    address={a}
                    chain=""
                    width={18}
                    height={18}
                    customURL=""
                    useContractLink={false}
                    className="text-xs"
                  />
                ))}
                {!contractAddress &&
                  equalsIgnoreCase(
                    String(contractMethod || ''),
                    'SquidCoral'
                  ) && (
                    <Profile
                      i={0}
                      address={
                        accounts.find(d =>
                          equalsIgnoreCase(d.name, 'Squid Coral')
                        )?.address
                      }
                      chain=""
                      width={18}
                      height={18}
                      noCopy={true}
                      customURL={`/gmp/search?contractMethod=${contractMethod}`}
                      useContractLink={false}
                      className="text-xs"
                    />
                  )}
              </div>
              <div className="mt-2 flex max-w-xl flex-wrap items-center">
                {TIME_SHORTCUTS.map((d, i) => {
                  const selected =
                    ((!fromTime && !_.head(d.value)) ||
                      _.head(d.value)?.unix() === toNumber(fromTime)) &&
                    ((!toTime && !_.last(d.value)) ||
                      _.last(d.value)?.unix() === toNumber(toTime));

                  return (
                    <Link
                      key={i}
                      href={`${pathname}${getQueryString({ ...params, fromTime: _.head(d.value)?.unix(), toTime: _.last(d.value)?.unix() })}`}
                      className={clsx(
                        'mb-1 mr-4 flex min-w-max items-center whitespace-nowrap text-xs sm:mb-0 sm:text-sm',
                        selected
                          ? 'font-semibold text-blue-600 dark:text-blue-500'
                          : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
                      )}
                    >
                      <span>{d.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <Filters />
              {refresh && typeof refresh !== 'boolean' ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                  className=""
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && typeof refresh !== 'boolean' && <Overlay />}
          <Summary
            data={data[generateKeyByParams(params)] as InterchainData}
            params={params}
          />
          <Charts
            data={data[generateKeyByParams(params)] as InterchainData}
            granularity={granularity}
            params={params}
          />
          <Tops
            data={data[generateKeyByParams(params)] as InterchainData}
            types={Array.isArray(types) ? types : [types]}
            params={params}
          />
          {types.includes('gmp') && (
            <GMPTimeSpents
              data={
                (timeSpentData?.[
                  generateKeyByParams(params)
                ] as InterchainData) || {}
              }
            />
          )}
        </div>
      )}
    </Container>
  );
}

'use client';

import _ from 'lodash';
import { usePathname } from 'next/navigation';

import { useGlobalStore } from '@/components/Global';
import { Number } from '@/components/Number';
import { toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import { SummaryProps } from './Summary.types';
import { processContracts, processTVLData } from './Summary.utils';

export function Summary({ data, params }: SummaryProps) {
  const pathname = usePathname();
  const globalStore = useGlobalStore();

  if (!data) {
    return null;
  }

  const {
    GMPStatsByChains,
    GMPTotalVolume,
    transfersStats,
    transfersTotalVolume,
  } = { ...data };

  const contracts = processContracts(data);

  const chains = params?.contractAddress
    ? _.uniq(contracts.flatMap(d => d.chains))
    : toArray(globalStore.chains).filter(
        d => !d.deprecated && (!d.maintainer_id || d.gateway?.address)
      );

  const tvlData = processTVLData(
    toArray(globalStore.tvl?.data),
    globalStore.assets,
    globalStore.itsAssets
  );

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700 lg:border-t lg:border-t-zinc-200 lg:dark:border-t-zinc-700">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            Transactions
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={
                toNumber(_.sumBy(GMPStatsByChains?.source_chains, 'num_txs')) +
                toNumber(transfersStats?.total)
              }
              format="0,0"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={toNumber(
                _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
              )}
              format="0,0.00a"
              prefix="GMP: "
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
            <Number
              value={toNumber(transfersStats?.total)}
              format="0,0.00a"
              prefix="Transfer: "
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:border-l-0 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            Volume
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)}
              format="0,0"
              prefix="$"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={toNumber(GMPTotalVolume)}
              format="0,0.00a"
              prefix="GMP: $"
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
            <Number
              value={toNumber(transfersTotalVolume)}
              format="0,0.00a"
              prefix="Transfer: $"
              noTooltip={true}
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
        {tvlData.length > 0 && pathname === '/' ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-l-0 lg:border-t-0 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
              Total Value Locked
            </dt>
            <dd className="w-full flex-none">
              <Number
                value={_.sumBy(
                  tvlData.filter(d => (d.value || 0) > 0),
                  'value'
                )}
                format="0,0.00a"
                prefix="$"
                noTooltip={true}
                className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
              />
            </dd>
            <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
              <Number
                value={_.sumBy(
                  tvlData.filter(
                    d => (d.value || 0) > 0 && d.assetType !== 'its'
                  ),
                  'value'
                )}
                format="0,0.00a"
                prefix="Gateway: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
              <Number
                value={_.sumBy(
                  tvlData.filter(
                    d => (d.value || 0) > 0 && d.assetType === 'its'
                  ),
                  'value'
                )}
                format="0,0.00a"
                prefix="ITS: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
            </dd>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-l-0 lg:border-t-0 xl:px-8">
            <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
              Average Volume / Transaction
            </dt>
            <dd className="w-full flex-none">
              <Number
                value={
                  (toNumber(GMPTotalVolume) + toNumber(transfersTotalVolume)) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) + toNumber(transfersStats?.total) || 1)
                }
                format="0,0"
                prefix="$"
                noTooltip={true}
                className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
              />
            </dd>
            <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
              <Number
                value={
                  toNumber(GMPTotalVolume) /
                  (toNumber(
                    _.sumBy(GMPStatsByChains?.source_chains, 'num_txs')
                  ) || 1)
                }
                format="0,0.00a"
                prefix="GMP: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
              <Number
                value={
                  toNumber(transfersTotalVolume) /
                  (toNumber(transfersStats?.total) || 1)
                }
                format="0,0.00a"
                prefix="Transfer: $"
                noTooltip={true}
                className="text-xs text-zinc-400 dark:text-zinc-500"
              />
            </dd>
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:border-l-0 sm:px-6 lg:border-t-0 xl:px-8">
          <dt className="text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500">
            GMP Contracts
          </dt>
          <dd className="w-full flex-none">
            <Number
              value={contracts.length}
              format="0,0"
              noTooltip={true}
              className="!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100"
            />
          </dd>
          <dd className="mt-1 grid w-full grid-cols-2 gap-x-2">
            <Number
              value={
                chains.filter(
                  d => !d.deprecated && (!d.maintainer_id || !d.no_inflation)
                ).length
              }
              format="0,0"
              prefix="Number of chains: "
              className="text-xs text-zinc-400 dark:text-zinc-500"
            />
          </dd>
        </div>
      </dl>
    </div>
  );
}

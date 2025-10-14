'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import clsx from 'clsx';
import _ from 'lodash';
import { useState } from 'react';

import { Container } from '@/components/Container';
import { useGlobalStore } from '@/components/Global';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { AssetProfile, ChainProfile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import { Switch } from '@/components/Switch';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { toArray } from '@/lib/parser';
import { ChainColumnCell } from './ChainColumnCell';
import { TotalLockedCell } from './TotalLockedCell';
import { useChainsTVL, useTVLData } from './TVL.hooks';
import {
  AssetData,
  ChainWithTotalValue,
  GlobalStore,
  ProcessedTVLData,
  TVLPerChain,
} from './TVL.types';

export function TVL() {
  const [includeITS, setIncludeITS] = useState<boolean>(true);
  const globalStore = useGlobalStore() as GlobalStore;
  const { chains, assets } = globalStore;

  // Load and process TVL data
  const data = useTVLData(globalStore);

  // Calculate loading state and filter data
  const loading: boolean = !(
    data &&
    assets &&
    data.length >= assets.filter((d: AssetData) => !d.no_tvl).length - 3
  );

  const filteredData: ProcessedTVLData[] = toArray(data).filter(
    (d): d is ProcessedTVLData => {
      if (d === null || d === undefined || typeof d === 'string') {
        return false;
      }
      return includeITS || d.assetType !== 'its';
    }
  );

  // Calculate chains TVL with memoization
  const chainsTVL = useChainsTVL(
    loading,
    filteredData,
    chains ?? undefined,
    assets ?? undefined,
    globalStore.itsAssets ?? undefined
  );

  // Early return for loading state
  if (loading) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="max-w-none sm:mt-0 lg:-mt-4">
      <div className="-mx-4 overflow-x-auto lg:overflow-x-visible">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead className="sticky top-0 z-20 bg-white dark:bg-zinc-900">
            <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <th scope="col" className="px-3 py-4 text-left">
                <div className="flex flex-col gap-y-0.5">
                  <span className="whitespace-nowrap">Asset</span>
                  <Switch
                    value={includeITS}
                    onChange={(v: boolean) => setIncludeITS(v)}
                    title="Including ITS"
                    groupClassName="!gap-x-1.5"
                    outerClassName="!h-4 !w-8"
                    innerClassName="!h-3 !w-3"
                    labelClassName="h-4 flex items-center"
                    titleClassName={clsx(
                      'text-xs !font-normal',
                      !includeITS && '!text-zinc-400 dark:!text-zinc-500'
                    )}
                  />
                </div>
              </th>
              <th scope="col" className="whitespace-nowrap px-3 py-4 text-left">
                <div className="flex flex-col gap-y-0.5">
                  <span className="whitespace-nowrap">Native Chain</span>
                  <div className="h-4" />
                </div>
              </th>
              <th scope="col" className="px-3 py-4 text-right">
                <div className="flex flex-col items-end gap-y-0.5">
                  <span className="whitespace-nowrap">Total Locked</span>
                  <Number
                    value={_.sumBy(
                      filteredData.filter((d: ProcessedTVLData) => d.value > 0),
                      'value'
                    )}
                    format="0,0.00a"
                    prefix="$"
                    noTooltip={true}
                    className="text-xs text-green-600 dark:text-green-500"
                  />
                </div>
              </th>
              <th scope="col" className="px-3 py-4 text-right">
                <div className="flex flex-col items-end gap-y-0.5">
                  <span className="whitespace-nowrap">Moved to EVM</span>
                  <Number
                    value={_.sumBy(
                      filteredData.filter(
                        (d: ProcessedTVLData) => d.value_on_evm > 0
                      ),
                      'value_on_evm'
                    )}
                    format="0,0.00a"
                    prefix="$"
                    noTooltip={true}
                    className="text-xs text-green-600 dark:text-green-500"
                  />
                </div>
              </th>
              <th scope="col" className="px-3 py-4 text-right">
                <div className="flex flex-col items-end gap-y-0.5">
                  <span className="whitespace-nowrap">Moved to Cosmos</span>
                  <Number
                    value={_.sumBy(
                      filteredData.filter(
                        (d: ProcessedTVLData) => d.value_on_cosmos > 0
                      ),
                      'value_on_cosmos'
                    )}
                    format="0,0.00a"
                    prefix="$"
                    noTooltip={true}
                    className="text-xs text-green-600 dark:text-green-500"
                  />
                </div>
              </th>
              {chainsTVL !== false &&
                chainsTVL.map((d: ChainWithTotalValue) => (
                  <th key={d.id} scope="col" className="px-3 py-4 text-right">
                    <div className="flex flex-col items-end gap-y-0.5">
                      <div className="flex min-w-max items-center gap-x-1.5">
                        <Image src={d.image} alt="" width={18} height={18} />
                        <span className="whitespace-nowrap">{d.name}</span>
                      </div>
                      <Number
                        value={d.total_value}
                        format="0,0.0a"
                        prefix="$"
                        noTooltip={true}
                        className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
                      />
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {filteredData
              .filter((d: ProcessedTVLData) => d.assetData)
              .map((d: ProcessedTVLData) => (
                <tr
                  key={d.asset}
                  className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                >
                  <td className="sticky left-0 z-10 px-3 py-4 text-left backdrop-blur backdrop-filter">
                    <div className="flex-items-center flex gap-x-2">
                      <AssetProfile
                        value={d.asset}
                        customAssetData={d.assetData}
                        ITSPossible={d.assetType === 'its'}
                        titleClassName="font-bold"
                        {...({} as any)}
                      />
                      {d.assetType === 'its' && (
                        <Tooltip
                          content={
                            Object.values({ ...d.tvl }).findIndex(
                              (d: TVLPerChain) =>
                                d.token_manager_type?.startsWith('lockUnlock')
                            ) > -1 && !d.assetData?.type?.includes('custom')
                              ? 'canonical ITS token'
                              : 'custom ITS token'
                          }
                          className="whitespace-nowrap"
                        >
                          <Tag className="w-fit bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                            ITS
                          </Tag>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-left">
                    <ChainProfile
                      value={d.nativeChain?.chainData?.id}
                      {...({} as any)}
                    />
                  </td>
                  <td className="px-3 py-4 text-right">
                    <TotalLockedCell data={d} />
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex flex-col items-end gap-y-1">
                      <Number
                        value={d.total_on_evm}
                        format="0,0.0a"
                        suffix={` ${d.assetData?.symbol}`}
                        className="text-sm font-semibold leading-4 text-zinc-700 dark:text-zinc-300"
                      />
                      {d.value_on_evm > 0 && (
                        <Number
                          value={d.value_on_evm}
                          format="0,0.0a"
                          prefix="$"
                          className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <div className="flex flex-col items-end gap-y-1">
                      <Number
                        value={d.total_on_cosmos}
                        format="0,0.0a"
                        suffix={` ${d.assetData?.symbol}`}
                        className="text-sm font-semibold leading-4 text-zinc-700 dark:text-zinc-300"
                      />
                      {d.value_on_cosmos > 0 && (
                        <Number
                          value={d.value_on_cosmos}
                          format="0,0.0a"
                          prefix="$"
                          className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
                        />
                      )}
                    </div>
                  </td>
                  {chainsTVL !== false &&
                    chainsTVL.map((c: ChainWithTotalValue) => (
                      <ChainColumnCell
                        key={c.id}
                        chainId={c.id}
                        tvlData={{ ...d.tvl?.[c.id] }}
                        price={d.price}
                      />
                    ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

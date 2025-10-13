'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import clsx from 'clsx';
import _ from 'lodash';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PiInfo } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { useGlobalStore } from '@/components/Global';
import { Image } from '@/components/Image';
import { Number } from '@/components/Number';
import { AssetProfile, ChainProfile } from '@/components/Profile';
import { Spinner } from '@/components/Spinner';
import { Switch } from '@/components/Switch';
import { Tag } from '@/components/Tag';
import { Tooltip } from '@/components/Tooltip';
import { getAssetData, getChainData, getITSAssetData } from '@/lib/config';
import { isNumber, toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import {
  AssetData,
  ChainData,
  ChainWithTotalValue,
  ContractData,
  CustomBalance,
  DenomData,
  GlobalStore,
  ITSAssetData,
  NativeChain,
  ProcessedTVLData,
  RawTVLData,
  TVLPerChain,
} from './TVL.types';

export function TVL() {
  const [data, setData] = useState<ProcessedTVLData[] | null>(null);
  const [includeITS, setIncludeITS] = useState<boolean>(true);
  const { chains, assets, itsAssets, tvl } = useGlobalStore() as GlobalStore;

  useEffect(() => {
    if (
      chains &&
      assets &&
      itsAssets &&
      tvl?.data &&
      tvl.data.length > (assets.length + itsAssets.length) / 2
    ) {
      setData(
        _.orderBy(
          tvl.data.map((d: RawTVLData, j: number): ProcessedTVLData => {
            const {
              asset,
              assetType,
              total_on_evm,
              total_on_cosmos,
              total_on_contracts,
              total_on_tokens,
              total,
            } = { ...d };
            let { price } = { ...d };

            const assetData: AssetData | undefined =
              assetType === 'its'
                ? (getITSAssetData(asset, itsAssets) as AssetData | undefined)
                : getAssetData(asset, assets) ||
                  (total_on_contracts > 0 || total_on_tokens > 0
                    ? ({
                        ...Object.values({ ...d.tvl }).find(
                          (d: TVLPerChain) => d.contract_data?.is_custom
                        )?.contract_data,
                      } as AssetData)
                    : undefined);
            price = toNumber(
              isNumber(price)
                ? price
                : isNumber(assetData?.price)
                  ? assetData?.price
                  : -1
            );

            return {
              ...d,
              i: asset === 'uaxl' ? -1 : 0,
              j,
              assetData,
              value_on_evm: toNumber(total_on_evm) * price,
              value_on_cosmos: toNumber(total_on_cosmos) * price,
              value: toNumber(total) * price,
              nativeChain: _.head(
                Object.entries({ ...d.tvl })
                  .filter(
                    ([k, v]: [string, TVLPerChain]) =>
                      toArray([v.contract_data, v.denom_data]).findIndex(
                        (d: ContractData | DenomData) =>
                          d.is_native || d.native_chain === k
                      ) > -1
                  )
                  .map(
                    ([k, v]: [string, TVLPerChain]): NativeChain => ({
                      chain: k,
                      chainData: getChainData(k, chains) as ChainData,
                      ...v,
                    })
                  )
              ),
            };
          }),
          ['i', 'value', 'total', 'j'],
          ['asc', 'desc', 'desc', 'asc']
        )
      );
    }
  }, [chains, assets, itsAssets, tvl, setData]);

  const loading: boolean = !(
    data &&
    assets &&
    data.length >= assets.filter((d: AssetData) => !d.no_tvl).length - 3
  );
  const filteredData: ProcessedTVLData[] = toArray(data).filter(
    (d: ProcessedTVLData) => includeITS || d.assetType !== 'its'
  );

  const chainsTVL: ChainWithTotalValue[] | false =
    !loading &&
    _.orderBy(
      _.uniqBy(
        chains!
          .filter(
            (d: ChainData) =>
              !d.no_inflation &&
              !d.no_tvl &&
              (d.chain_type !== 'vm' ||
                filteredData.filter((_d: ProcessedTVLData) => _d.tvl?.[d.id])
                  .length > 0)
          )
          .map(
            (d: ChainData): ChainWithTotalValue => ({
              ...d,
              total_value: _.sumBy(
                filteredData
                  .map((_d: ProcessedTVLData) => {
                    const { supply, total } = { ..._d.tvl?.[d.id] };
                    const isLockUnlock: boolean =
                      _d.assetType === 'its' &&
                      Object.values({ ..._d.tvl }).findIndex((d: TVLPerChain) =>
                        d.contract_data?.token_manager_type?.startsWith(
                          'lockUnlock'
                        )
                      ) < 0;

                    let { price } = { ..._d };

                    if (!isLockUnlock && !price) {
                      const assetData: AssetData | ITSAssetData | undefined =
                        _d.assetType === 'its'
                          ? getITSAssetData(_d.asset, itsAssets)
                          : getAssetData(_d.asset, assets);
                      price = toNumber(
                        isNumber(assetData?.price) ? assetData?.price : 0
                      );
                    }

                    return {
                      ..._d,
                      value: isLockUnlock
                        ? 0
                        : // @ts-expect-error -- figure out if NaN is on purpose
                          toNumber((supply || total) * price),
                    };
                  })
                  .filter(
                    (d: ProcessedTVLData & { value: number }) => d.value > 0
                  ),
                'value'
              ),
            })
          ),
        'id'
      ),
      ['total_value'],
      ['desc']
    );

  return (
    <Container
      className={clsx(!loading ? 'max-w-none sm:mt-0 lg:-mt-4' : 'sm:mt-8')}
    >
      {loading ? (
        <Spinner {...({} as any)} />
      ) : (
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
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-4 text-left"
                >
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
                        filteredData.filter(
                          (d: ProcessedTVLData) => d.value > 0
                        ),
                        'value'
                      )}
                      format="0,0.00a"
                      prefix="$"
                      noTooltip={true}
                      className="text-xs text-green-600 dark:text-green-500"
                      {...({} as any)}
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
                      {...({} as any)}
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
                      {...({} as any)}
                    />
                  </div>
                </th>
                {chainsTVL !== false &&
                  chainsTVL.map((d: ChainWithTotalValue) => (
                    <th key={d.id} scope="col" className="px-3 py-4 text-right">
                      <div className="flex flex-col items-end gap-y-0.5">
                        <div className="flex min-w-max items-center gap-x-1.5">
                          <Image
                            src={d.image}
                            alt=""
                            width={18}
                            height={18}
                            {...({} as any)}
                          />
                          <span className="whitespace-nowrap">{d.name}</span>
                        </div>
                        <Number
                          value={d.total_value}
                          format="0,0.0a"
                          prefix="$"
                          noTooltip={true}
                          className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
                          {...({} as any)}
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
                            {...({} as any)}
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
                      {[d].map((d: ProcessedTVLData) => {
                        const { url } = { ...d.nativeChain };

                        const element = (
                          <Number
                            value={d.total}
                            format="0,0.0a"
                            suffix={` ${d.assetData?.symbol}`}
                            className={clsx(
                              'text-sm font-semibold leading-4',
                              !url && 'text-zinc-700 dark:text-zinc-300'
                            )}
                            {...({} as any)}
                          />
                        );

                        const isLockUnlock: boolean =
                          d.assetType === 'its' &&
                          Object.values({ ...d.tvl }).findIndex(
                            (d: TVLPerChain) =>
                              d.contract_data?.token_manager_type?.startsWith(
                                'lockUnlock'
                              )
                          ) < 0;

                        return (
                          <div
                            key={d.asset}
                            className="flex flex-col items-end gap-y-1"
                          >
                            <div className="flex items-center space-x-1">
                              {url ? (
                                <Link
                                  href={url}
                                  target="_blank"
                                  className="contents text-blue-600 dark:text-blue-500"
                                >
                                  {element}
                                </Link>
                              ) : (
                                element
                              )}
                              {isLockUnlock && (
                                <Tooltip
                                  content="The circulating supply retrieved from CoinGecko used for TVL tracking."
                                  className="w-56 text-left text-xs"
                                  {...({} as any)}
                                >
                                  <PiInfo className="mb-0.5 text-zinc-400 dark:text-zinc-500" />
                                </Tooltip>
                              )}
                            </div>
                            {d.value > 0 && (
                              <Number
                                value={d.value}
                                format="0,0.0a"
                                prefix="$"
                                className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
                                {...({} as any)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex flex-col items-end gap-y-1">
                        <Number
                          value={d.total_on_evm}
                          format="0,0.0a"
                          suffix={` ${d.assetData?.symbol}`}
                          className="text-sm font-semibold leading-4 text-zinc-700 dark:text-zinc-300"
                          {...({} as any)}
                        />
                        {d.value_on_evm > 0 && (
                          <Number
                            value={d.value_on_evm}
                            format="0,0.0a"
                            prefix="$"
                            className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
                            {...({} as any)}
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
                          {...({} as any)}
                        />
                        {d.value_on_cosmos > 0 && (
                          <Number
                            value={d.value_on_cosmos}
                            format="0,0.0a"
                            prefix="$"
                            className="text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500"
                            {...({} as any)}
                          />
                        )}
                      </div>
                    </td>
                    {chainsTVL !== false &&
                      chainsTVL.map((c: ChainWithTotalValue) => {
                        const {
                          escrow_balance,
                          supply,
                          total,
                          url,
                          custom_contracts_balance,
                          custom_tokens_supply,
                        }: TVLPerChain = { ...d.tvl?.[c.id] };
                        const amount: number | undefined =
                          (isNumber(escrow_balance) && c.id !== 'axelarnet'
                            ? escrow_balance
                            : supply) || total;
                        // @ts-expect-error -- figure out if NaN is on purpose
                        const value: number = amount * d.price;

                        const element = (
                          <Number
                            value={amount}
                            format="0,0.0a"
                            className={clsx(
                              'text-xs font-semibold',
                              !url && 'text-zinc-700 dark:text-zinc-300'
                            )}
                            {...({} as any)}
                          />
                        );

                        return (
                          <td key={c.id} className="px-3 py-4 text-right">
                            <div className="flex flex-col items-end gap-y-1">
                              <div className="flex flex-col items-end gap-y-0.5">
                                {url ? (
                                  <Link
                                    href={url}
                                    target="_blank"
                                    className="contents text-blue-600 dark:text-blue-500"
                                  >
                                    {element}
                                  </Link>
                                ) : (
                                  element
                                )}
                                {value > 0 && (
                                  <Number
                                    value={value}
                                    format="0,0.0a"
                                    prefix="$"
                                    className="text-xs font-medium text-zinc-400 dark:text-zinc-500"
                                    {...({} as any)}
                                  />
                                )}
                              </div>
                              {toArray(
                                _.concat(
                                  custom_contracts_balance,
                                  custom_tokens_supply
                                )
                              ).map((c: CustomBalance, i: number) => {
                                const { balance, supply, url }: CustomBalance =
                                  { ...c };
                                const amount: number | undefined = isNumber(
                                  balance
                                )
                                  ? balance
                                  : supply;
                                const value: number =
                                  // @ts-expect-error -- figure out if NaN is on purpose
                                  amount * d.price;

                                const element = (
                                  <Number
                                    value={value}
                                    format="0,0.0a"
                                    prefix="+$"
                                    className={clsx(
                                      '!text-2xs font-semibold',
                                      !url && 'text-zinc-700 dark:text-zinc-300'
                                    )}
                                    {...({} as any)}
                                  />
                                );

                                return (
                                  <div
                                    key={i}
                                    className="flex flex-col items-end"
                                  >
                                    {url ? (
                                      <Link
                                        href={url}
                                        target="_blank"
                                        className="contents text-green-600 dark:text-green-500"
                                      >
                                        {element}
                                      </Link>
                                    ) : (
                                      element
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}

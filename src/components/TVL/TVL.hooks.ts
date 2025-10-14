import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { getAssetData, getChainData, getITSAssetData } from '@/lib/config';
import { isNumber, toNumber } from '@/lib/number';
import { toArray } from '@/lib/parser';
import {
  AssetData,
  ChainData,
  ChainWithTotalValue,
  ContractData,
  DenomData,
  GlobalStore,
  ITSAssetData,
  NativeChain,
  ProcessedTVLData,
  RawTVLData,
  TVLPerChain,
} from './TVL.types';

/**
 * Hook to process and manage TVL data
 */
export function useTVLData(globalStore: GlobalStore) {
  const [data, setData] = useState<ProcessedTVLData[] | null>(null);
  const { chains, assets, itsAssets, tvl } = globalStore;

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
                        (d): d is ContractData | DenomData => {
                          if (!d || typeof d === 'string') {
                            return false;
                          }
                          return d.is_native || d.native_chain === k;
                        }
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

  return data;
}

/**
 * Hook to calculate chains TVL with memoization
 */
export function useChainsTVL(
  loading: boolean,
  filteredData: ProcessedTVLData[],
  chains: ChainData[] | undefined,
  assets: AssetData[] | undefined,
  itsAssets: ITSAssetData[] | undefined
): ChainWithTotalValue[] | false {
  return useMemo(() => {
    if (loading || !chains) {
      return false;
    }

    return _.orderBy(
      _.uniqBy(
        chains
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
  }, [loading, filteredData, chains, assets, itsAssets]);
}

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
 * Gets asset data for a given asset, handling ITS and custom assets
 */
function getAssetDataForTVL(
  rawAsset: RawTVLData,
  assets: AssetData[],
  itsAssets: ITSAssetData[]
): AssetData | undefined {
  const { asset, assetType, total_on_contracts, total_on_tokens, tvl } =
    rawAsset;

  // Handle ITS assets
  if (assetType === 'its') {
    return getITSAssetData(asset, itsAssets) as AssetData | undefined;
  }

  // Try to get regular asset data
  const regularAssetData = getAssetData(asset, assets);
  if (regularAssetData) {
    return regularAssetData;
  }

  // For custom assets with contracts or tokens, extract from TVL data
  const hasCustomAssets = total_on_contracts > 0 || total_on_tokens > 0;
  if (!hasCustomAssets) {
    return undefined;
  }

  const tvlValues = Object.values({ ...tvl });
  const customContractData = tvlValues.find(
    (tvlData: TVLPerChain) => tvlData.contract_data?.is_custom
  )?.contract_data;

  return { ...customContractData } as AssetData;
}

/**
 * Resolves the price for an asset
 */
function resolveAssetPrice(
  rawPrice: number | undefined,
  assetData: AssetData | undefined
): number {
  // Use provided price if valid
  if (isNumber(rawPrice)) {
    return toNumber(rawPrice);
  }

  // Fall back to asset data price
  if (isNumber(assetData?.price)) {
    return toNumber(assetData.price);
  }

  // Default to -1 if no price available
  return -1;
}

/**
 * Finds the native chain for an asset from its TVL data
 */
function findNativeChain(
  tvl: Record<string, TVLPerChain> | undefined,
  chains: ChainData[]
): NativeChain | undefined {
  if (!tvl) {
    return undefined;
  }

  const tvlEntries = Object.entries({ ...tvl });

  // Filter to chains where this asset is native
  const nativeChainEntries = tvlEntries.filter(
    ([chainId, tvlData]: [string, TVLPerChain]) => {
      const dataItems = toArray([tvlData.contract_data, tvlData.denom_data]);

      const hasNativeItem = dataItems.some(
        (item): item is ContractData | DenomData => {
          if (!item || typeof item === 'string') {
            return false;
          }
          return item.is_native || item.native_chain === chainId;
        }
      );

      return hasNativeItem;
    }
  );

  // Map to native chain objects
  const nativeChains = nativeChainEntries.map(
    ([chainId, tvlData]: [string, TVLPerChain]): NativeChain => ({
      chain: chainId,
      chainData: getChainData(chainId, chains) as ChainData,
      ...tvlData,
    })
  );

  return _.head(nativeChains);
}

/**
 * Hook to process and manage TVL data
 */
export function useTVLData(globalStore: GlobalStore) {
  const [processedData, setProcessedData] = useState<ProcessedTVLData[] | null>(
    null
  );
  const { chains, assets, itsAssets, tvl } = globalStore;

  useEffect(() => {
    const hasRequiredData = chains && assets && itsAssets && tvl?.data;

    if (!hasRequiredData) {
      return;
    }

    const minimumDataThreshold = (assets.length + itsAssets.length) / 2;
    const hasEnoughData = tvl.data.length > minimumDataThreshold;

    if (!hasEnoughData) {
      return;
    }

    // Process each raw TVL entry
    const processed = tvl.data.map(
      (rawData: RawTVLData, index: number): ProcessedTVLData => {
        const { asset, total_on_evm, total_on_cosmos, total } = rawData;

        // Get asset metadata
        const assetData = getAssetDataForTVL(rawData, assets, itsAssets);

        // Resolve the price
        const price = resolveAssetPrice(rawData.price, assetData);

        // Calculate USD values
        const totalValue = toNumber(total) * price;
        const evmValue = toNumber(total_on_evm) * price;
        const cosmosValue = toNumber(total_on_cosmos) * price;

        // Find native chain
        const nativeChain = findNativeChain(rawData.tvl, chains);

        // Determine sort priority (uaxl comes first)
        const sortPriority = asset === 'uaxl' ? -1 : 0;

        return {
          ...rawData,
          i: sortPriority,
          j: index,
          assetData,
          price,
          value_on_evm: evmValue,
          value_on_cosmos: cosmosValue,
          value: totalValue,
          nativeChain,
        };
      }
    );

    // Sort by priority, then value, then total, then original index
    const sorted = _.orderBy(
      processed,
      ['i', 'value', 'total', 'j'],
      ['asc', 'desc', 'desc', 'asc']
    );

    setProcessedData(sorted);
  }, [chains, assets, itsAssets, tvl, setProcessedData]);

  return processedData;
}

/**
 * Checks if an ITS asset uses lock/unlock mechanism (not mint/burn)
 */
function isLockUnlockITS(asset: ProcessedTVLData): boolean {
  if (asset.assetType !== 'its') {
    return false;
  }

  const tvlValues = Object.values({ ...asset.tvl });
  const hasLockUnlock = tvlValues.some((tvlData: TVLPerChain) =>
    tvlData.contract_data?.token_manager_type?.startsWith('lockUnlock')
  );

  // If no lock/unlock found, it's mint/burn
  return !hasLockUnlock;
}

/**
 * Calculates the value of an asset on a specific chain
 */
function calculateAssetValueOnChain(
  asset: ProcessedTVLData,
  chainId: string,
  assets: AssetData[] | undefined,
  itsAssets: ITSAssetData[] | undefined
): number {
  const chainTVL = asset.tvl?.[chainId];
  if (!chainTVL) {
    return 0;
  }

  const { supply, total } = chainTVL;
  const amount = supply || total;

  // Lock/unlock ITS tokens have 0 value (counted elsewhere)
  const isLockUnlock = isLockUnlockITS(asset);
  if (isLockUnlock) {
    return 0;
  }

  // Get price
  let assetPrice = asset.price;

  // If no price, try to fetch it
  if (!assetPrice) {
    const assetData: AssetData | ITSAssetData | undefined =
      asset.assetType === 'its'
        ? getITSAssetData(asset.asset, itsAssets)
        : getAssetData(asset.asset, assets);

    assetPrice = toNumber(isNumber(assetData?.price) ? assetData.price : 0);
  }

  // @ts-expect-error -- figure out if NaN is on purpose
  return toNumber(amount * assetPrice);
}

/**
 * Checks if a chain should be included in the TVL table
 */
function shouldIncludeChain(
  chain: ChainData,
  filteredData: ProcessedTVLData[]
): boolean {
  // Exclude chains marked as no_inflation or no_tvl
  if (chain.no_inflation || chain.no_tvl) {
    return false;
  }

  // For VM chains, only include if they have TVL data
  if (chain.chain_type === 'vm') {
    const hasData = filteredData.some(
      (asset: ProcessedTVLData) => asset.tvl?.[chain.id]
    );
    return hasData;
  }

  return true;
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

    // Filter chains to include
    const includedChains = chains.filter((chain: ChainData) =>
      shouldIncludeChain(chain, filteredData)
    );

    // Calculate total value for each chain
    const chainsWithValues = includedChains.map(
      (chain: ChainData): ChainWithTotalValue => {
        // Calculate total value across all assets on this chain
        const assetsWithValues = filteredData.map((asset: ProcessedTVLData) => {
          const value = calculateAssetValueOnChain(
            asset,
            chain.id,
            assets,
            itsAssets
          );

          return {
            ...asset,
            value,
          };
        });

        // Filter to only assets with positive value
        const positiveValueAssets = assetsWithValues.filter(
          (asset: ProcessedTVLData & { value: number }) => asset.value > 0
        );

        // Sum up all values
        const totalValue = _.sumBy(positiveValueAssets, 'value');

        return {
          ...chain,
          total_value: totalValue,
        };
      }
    );

    // Remove duplicates by ID and sort by total value descending
    const uniqueChains = _.uniqBy(chainsWithValues, 'id');
    const sortedChains = _.orderBy(uniqueChains, ['total_value'], ['desc']);

    return sortedChains;
  }, [loading, filteredData, chains, assets, itsAssets]);
}

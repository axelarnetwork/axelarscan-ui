'use client';

import { useState } from 'react';

import { Container } from '@/components/Container';
import { useGlobalStore } from '@/components/Global';
import { Spinner } from '@/components/Spinner';
import { toArray } from '@/lib/parser';
import { AssetRow } from './AssetRow';
import { useChainsTVL, useTVLData } from './TVL.hooks';
import { tvlStyles } from './TVL.styles';
import { AssetData, GlobalStore, ProcessedTVLData } from './TVL.types';
import { TVLTableHeader } from './TVLTableHeader';

export function TVL() {
  const [includeITS, setIncludeITS] = useState<boolean>(true);
  const globalStore = useGlobalStore() as GlobalStore;
  const { chains, assets, itsAssets } = globalStore;

  const processedData = useTVLData(globalStore);

  const hasData = processedData && assets;
  const minAssetCount = assets
    ? assets.filter((asset: AssetData) => !asset.no_tvl).length - 3
    : 0;
  const hasEnoughAssets =
    processedData && processedData.length >= minAssetCount;
  const loading = !hasData || !hasEnoughAssets;

  const allData = toArray(processedData);
  const filteredData: ProcessedTVLData[] = allData.filter(
    (item): item is ProcessedTVLData => {
      if (item === null || item === undefined || typeof item === 'string') {
        return false;
      }

      if (includeITS) {
        return true;
      }

      return item.assetType !== 'its';
    }
  );

  const chainsTVL = useChainsTVL(
    loading,
    filteredData,
    chains ?? undefined,
    assets ?? undefined,
    itsAssets ?? undefined
  );

  if (loading) {
    return (
      <Container className={tvlStyles.loadingContainer}>
        <Spinner />
      </Container>
    );
  }

  const assetsWithData = filteredData.filter(
    (asset: ProcessedTVLData) => asset.assetData
  );

  return (
    <Container className={tvlStyles.container}>
      <div className={tvlStyles.tableWrapper}>
        <table className={tvlStyles.table}>
          <TVLTableHeader
            includeITS={includeITS}
            onToggleITS={setIncludeITS}
            filteredData={filteredData}
            chainsTVL={chainsTVL}
          />
          <tbody className={tvlStyles.tableBody}>
            {assetsWithData.map((asset: ProcessedTVLData) => (
              <AssetRow key={asset.asset} data={asset} chainsTVL={chainsTVL} />
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

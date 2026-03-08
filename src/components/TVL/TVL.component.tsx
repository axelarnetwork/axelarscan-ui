'use client';

import { useMemo, useState } from 'react';

import { Container } from '@/components/Container';
import {
  useChains,
  useAssets,
  useITSAssets,
  useTVL as useTVLStore,
} from '@/hooks/useGlobalData';
import { Spinner } from '@/components/Spinner';
import { AssetRow } from './AssetRow.component';
import { useChainsTVL, useTVLData } from './TVL.hooks';
import { tvlStyles } from './TVL.styles';
import { Asset, GlobalStore, ProcessedTVLData } from './TVL.types';
import { TVLTableHeader } from './TVLTableHeader.component';

export function TVL() {
  const [includeITS, setIncludeITS] = useState<boolean>(true);
  const chains = useChains();
  const assets = useAssets();
  const itsAssets = useITSAssets();
  const tvl = useTVLStore();
  const globalStore: GlobalStore = {
    chains,
    assets,
    itsAssets,
    tvl: tvl as GlobalStore['tvl'],
  };

  const processedData = useTVLData(globalStore);

  const minAssetCount = useMemo(
    () => assets ? (assets as Asset[]).filter((asset: Asset) => !asset.no_tvl).length - 3 : 0,
    [assets]
  );

  const hasData = processedData && assets;
  const hasEnoughAssets =
    processedData && processedData.length >= minAssetCount;
  const loading = !hasData || !hasEnoughAssets;

  const filteredData = useMemo(() => {
    if (!processedData) return [];
    return processedData.filter(
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
  }, [processedData, includeITS]);

  const assetsWithData = useMemo(
    () => filteredData.filter((asset: ProcessedTVLData) => asset.assetData),
    [filteredData]
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

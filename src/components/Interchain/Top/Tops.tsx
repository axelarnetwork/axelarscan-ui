import { useGlobalStore } from '@/components/Global';
import { getAssetData, getITSAssetData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { ChainWithContracts, TopDataItem } from '../Interchain.types';
import { Top } from './Top';
import { topsStyles } from './Tops.styles';
import { TopsProps } from './Tops.types';
import {
  getTopData,
  processChainPairs,
  processContracts,
  processDestinationChains,
  processGMPUsers,
  processITSAssets,
  processITSUsers,
  processSourceChains,
  processTransfersUsers,
} from './Tops.utils';

export function Tops({ data, types, params }: TopsProps) {
  const { chains, assets, itsAssets } = useGlobalStore();

  if (!data) return null;

  const {
    GMPStatsByChains,
    GMPStatsByContracts,
    GMPTopUsers,
    GMPTopITSUsers,
    GMPTopITSUsersByVolume,
    GMPTopITSAssets,
    GMPTopITSAssetsByVolume,
    transfersStats,
    transfersTopUsers,
    transfersTopUsersByVolume,
  } = { ...data };

  const hasTransfers =
    types.includes('transfers') &&
    !(
      params?.assetType === 'its' ||
      toArray(params?.asset).findIndex(a => getITSAssetData(a, itsAssets)) > -1
    );
  const hasGMP = types.includes('gmp');
  const hasITS =
    hasGMP &&
    params?.assetType !== 'gateway' &&
    toArray(params?.asset).findIndex(a => getAssetData(a, assets)) < 0;

  const chainPairs = processChainPairs(
    { GMPStatsByChains, transfersStats },
    chains
  );

  const sourceChains = processSourceChains(
    { GMPStatsByChains, transfersStats },
    chains
  );

  const destionationChains = processDestinationChains(
    { GMPStatsByChains, transfersStats },
    chains
  );

  const transfersUsers = processTransfersUsers(
    (toArray(transfersTopUsers?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains
  );

  const transfersUsersByVolume = processTransfersUsers(
    (toArray(transfersTopUsersByVolume?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains
  );

  const contracts = processContracts(
    (toArray(GMPStatsByContracts?.chains) || []).filter(
      (item): item is ChainWithContracts =>
        item !== undefined && typeof item !== 'string'
    ),
    chains
  );

  const GMPUsers = processGMPUsers(
    (toArray(GMPTopUsers?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains
  );

  const ITSUsers = processITSUsers(
    (toArray(GMPTopITSUsers?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains,
    false
  );

  const ITSUsersByVolume = processITSUsers(
    (toArray(GMPTopITSUsersByVolume?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains,
    true
  );

  const ITSAssets = processITSAssets(
    (toArray(GMPTopITSAssets?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains,
    itsAssets,
    false
  );

  const ITSAssetsByVolume = processITSAssets(
    (toArray(GMPTopITSAssetsByVolume?.data) || []).filter(
      (item): item is TopDataItem =>
        item !== undefined && typeof item !== 'string'
    ),
    chains,
    itsAssets,
    true
  );

  return (
    <div className={topsStyles.container}>
      <div className={topsStyles.grid.main(hasTransfers, hasGMP)}>
        <div className={topsStyles.grid.topRow(hasTransfers, hasGMP)}>
          <Top
            index={0}
            data={getTopData(chainPairs, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Paths"
            description="by transactions"
            className="h-48"
          />
          <Top
            index={1}
            data={getTopData(sourceChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Sources"
            description="by transactions"
            className="h-48"
          />
          <Top
            index={2}
            data={getTopData(destionationChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Destinations"
            description="by transactions"
            className="h-48"
          />
          <Top
            index={3}
            data={getTopData(chainPairs, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Paths"
            description="by volume"
            prefix="$"
            className="h-48"
          />
          <Top
            index={4}
            data={getTopData(sourceChains, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Sources"
            description="by volume"
            prefix="$"
            className="h-48"
          />
          <Top
            index={5}
            data={getTopData(destionationChains, 'volume', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            field="volume"
            title="Top Destinations"
            description="by volume"
            prefix="$"
            className="h-48"
          />
        </div>
        <div className={topsStyles.grid.middleRow(hasTransfers, hasGMP)}>
          {hasTransfers && (
            <>
              <Top
                index={0}
                data={getTopData(transfersUsers, 'num_txs', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                hasITS={hasITS}
                transfersType="transfers"
                title="Top Users"
                description="Top users by token transfers transactions"
                className="h-96"
              />
              <Top
                index={1}
                data={getTopData(transfersUsersByVolume, 'volume', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                hasITS={hasITS}
                transfersType="transfers"
                field="volume"
                title="Top Users"
                description="Top users by token transfers volume"
                prefix="$"
                className="h-96"
              />
            </>
          )}
          {hasGMP && (
            <>
              <Top
                index={2}
                data={getTopData(contracts, 'num_txs', 100)}
                type="contract"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                transfersType=""
                title="Top Contracts"
                description="Top contracts by GMP transactions"
                className="h-96"
              />
              <Top
                index={3}
                data={getTopData(GMPUsers, 'num_txs', 100)}
                type="address"
                hasTransfers={hasTransfers}
                hasGMP={hasGMP}
                transfersType="gmp"
                title="Top GMP Users"
                description="Top users by GMP transactions"
                className="h-96"
              />
            </>
          )}
        </div>
        {hasITS &&
          !(
            typeof params?.contractMethod === 'string' &&
            equalsIgnoreCase(params.contractMethod, 'SquidCoral')
          ) && (
            <div className={topsStyles.grid.bottomRow(hasTransfers)}>
              <Top
                index={0}
                data={getTopData(ITSUsers, 'num_txs', 100)}
                type="address"
                transfersType="gmp"
                title="Top ITS Users"
                description="Top users by ITS transactions"
                className="h-96"
              />
              <Top
                index={1}
                data={getTopData(ITSUsersByVolume, 'volume', 100)}
                type="address"
                transfersType="gmp"
                field="volume"
                title="Top ITS Users"
                description="Top users by ITS volume"
                prefix="$"
                className="h-96"
              />
              <Top
                index={2}
                data={getTopData(ITSAssets, 'num_txs', 100)}
                type="asset"
                transfersType="gmp"
                title="Top ITS Assets"
                description="Top assets by ITS transactions"
                className="h-96"
              />
              <Top
                index={3}
                data={getTopData(ITSAssetsByVolume, 'volume', 100)}
                type="asset"
                transfersType="gmp"
                field="volume"
                title="Top ITS Assets"
                description="Top assets by ITS volume"
                prefix="$"
                className="h-96"
              />
            </div>
          )}
      </div>
    </div>
  );
}

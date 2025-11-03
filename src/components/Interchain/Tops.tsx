import clsx from 'clsx';
import _ from 'lodash';

import { useGlobalStore } from '@/components/Global';
import accounts from '@/data/accounts';
import { getAssetData, getChainData, getITSAssetData } from '@/lib/config';
import { toArray, toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import {
  ChainWithContracts,
  ContractData,
  GroupDataItem,
  SourceChainData,
  TopDataItem,
  TransferStatsItem,
} from './Interchain.types';
import { Top } from './Top';
import { TopsProps } from './Tops.types';

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

  const groupData = (data: GroupDataItem[], by = 'key') =>
    Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
      key: (v[0] as GroupDataItem)?.key || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === 'customKey'
                ? (v[0] as GroupDataItem)?.chain
                : (v as GroupDataItem[]).map((d: GroupDataItem) => d.chain)
            )
          ).map((d: string | string[] | undefined) =>
            getChainData(d as string, chains)
          )
        ),
        ['i'],
        ['asc']
      ).map(d => d.id),
    }));

  const getTopData = (
    data: GroupDataItem[],
    field = 'num_txs',
    n = 5
  ): GroupDataItem[] =>
    _.slice(
      _.orderBy(toArray(data) as GroupDataItem[], [field], ['desc']),
      0,
      n
    );

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

  const chainPairs = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: `${s.key}_${d.key}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: `${d.source_chain}_${d.destination_chain}`,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const sourceChains = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: s.key,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.source_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const destionationChains = groupData(
    _.concat(
      (
        toArray(
          GMPStatsByChains?.source_chains as SourceChainData[]
        ) as SourceChainData[]
      ).flatMap((s: SourceChainData) =>
        (
          toArray(s.destination_chains) as Array<{
            key: string;
            num_txs?: number;
            volume?: number;
          }>
        ).map(d => ({
          key: d.key,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
      ),
      (
        toArray(
          transfersStats?.data as TransferStatsItem[]
        ) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.destination_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    )
  );

  const transfersUsers = groupData(
    (toArray(transfersTopUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: d.key,
          customKey: name || d.key,
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }
    ),
    'customKey'
  );

  const transfersUsersByVolume = groupData(
    (
      toArray(transfersTopUsersByVolume?.data as TopDataItem[]) as TopDataItem[]
    ).map((d: TopDataItem) => {
      const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
      const name = account?.name;

      return {
        key: d.key,
        customKey: name || d.key,
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    'customKey'
  );

  const contracts = groupData(
    (
      toArray(
        GMPStatsByContracts?.chains as ChainWithContracts[]
      ) as ChainWithContracts[]
    ).flatMap((d: ChainWithContracts) =>
      (toArray(d.contracts as ContractData[]) as ContractData[]).map(
        (c: ContractData) => {
          const account = accounts.find(a =>
            equalsIgnoreCase(a.address, c.key)
          );
          const name = account?.name;

          return {
            key: toCase(c.key, 'lower'),
            customKey: name || toCase(c.key, 'lower'),
            num_txs: c.num_txs,
            volume: c.volume,
            chain: d.key,
          };
        }
      )
    ),
    'customKey'
  );

  const GMPUsers = groupData(
    (toArray(GMPTopUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSUsers = groupData(
    (toArray(GMPTopITSUsers?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSUsersByVolume = groupData(
    (toArray(GMPTopITSUsersByVolume?.data as TopDataItem[]) as TopDataItem[])
      .filter((d: TopDataItem) => (d.volume || 0) > 0)
      .map((d: TopDataItem) => {
        const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
        const name = account?.name;

        return {
          key: toCase(d.key, 'lower'),
          customKey: name || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }),
    'customKey'
  );

  const ITSAssets = groupData(
    (toArray(GMPTopITSAssets?.data as TopDataItem[]) as TopDataItem[]).map(
      (d: TopDataItem) => {
        const { symbol } = { ...getITSAssetData(d.key, itsAssets) };

        return {
          key: toCase(d.key, 'lower'),
          customKey: symbol || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
        };
      }
    ),
    'customKey'
  );

  const ITSAssetsByVolume = groupData(
    (toArray(GMPTopITSAssetsByVolume?.data as TopDataItem[]) as TopDataItem[])
      .filter((d: TopDataItem) => (d.volume || 0) > 0)
      .map((d: TopDataItem) => {
        const { symbol } = { ...getITSAssetData(d.key, itsAssets) };

        return {
          key: toCase(d.key, 'lower'),
          customKey: symbol || toCase(d.key, 'lower'),
          num_txs: d.num_txs,
          volume: d.volume,
        };
      }),
    'customKey'
  );

  return (
    <div className="border-b border-b-zinc-200 dark:border-b-zinc-700">
      <div
        className={clsx(
          'grid lg:px-2 xl:px-0',
          hasTransfers && hasGMP ? '' : 'lg:grid-cols-2'
        )}
      >
        <div
          className={clsx(
            'grid grid-cols-2 sm:grid-cols-3',
            hasTransfers && hasGMP ? 'lg:grid-cols-6' : ''
          )}
        >
          <Top
            i={0}
            data={getTopData(chainPairs, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Paths"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={1}
            data={getTopData(sourceChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Sources"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={2}
            data={getTopData(destionationChains, 'num_txs', 100)}
            hasTransfers={hasTransfers}
            hasGMP={hasGMP}
            transfersType=""
            title="Top Destinations"
            description="by transactions"
            className="h-48"
          />
          <Top
            i={3}
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
            i={4}
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
            i={5}
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
        <div
          className={clsx(
            'grid sm:grid-cols-2',
            hasTransfers && hasGMP ? 'lg:grid-cols-4' : ''
          )}
        >
          {hasTransfers && (
            <>
              <Top
                i={0}
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
                i={1}
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
                i={2}
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
                i={3}
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
            <div
              className={clsx(
                'grid sm:grid-cols-2 lg:grid-cols-4',
                !hasTransfers && 'lg:col-span-2'
              )}
            >
              <Top
                i={0}
                data={getTopData(ITSUsers, 'num_txs', 100)}
                type="address"
                transfersType="gmp"
                title="Top ITS Users"
                description="Top users by ITS transactions"
                className="h-96"
              />
              <Top
                i={1}
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
                i={2}
                data={getTopData(ITSAssets, 'num_txs', 100)}
                type="asset"
                transfersType="gmp"
                title="Top ITS Assets"
                description="Top assets by ITS transactions"
                className="h-96"
              />
              <Top
                i={3}
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

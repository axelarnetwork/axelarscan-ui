import _ from 'lodash';

import accounts from '@/data/accounts';
import { getAssetData, getITSAssetData } from '@/lib/config';
import { isNumber, toNumber } from '@/lib/number';
import { toArray, toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import {
  AssetData,
  ChainWithContracts,
  ContractData,
  ITSAssetData,
  InterchainData,
  TVLData,
  TVLItem,
} from '../Interchain.types';

export interface ProcessedContract {
  key: string;
  chains: string[];
  num_txs: number;
  volume: number;
}

export function processContracts(data: InterchainData): ProcessedContract[] {
  const { GMPStatsByContracts } = { ...data };

  return _.orderBy(
    Object.entries(
      _.groupBy(
        (
          toArray(
            GMPStatsByContracts?.chains as ChainWithContracts[]
          ) as ChainWithContracts[]
        ).flatMap((d: ChainWithContracts) =>
          (toArray(d.contracts as ContractData[]) as ContractData[])
            .filter(c => (c as ContractData).key?.includes('_') === false)
            .map(c => {
              const contract = c as ContractData;
              const account = accounts.find(a =>
                equalsIgnoreCase(a.address, contract.key)
              );
              const name = account?.name;

              return {
                ...contract,
                key: name || toCase(contract.key, 'lower'),
                chain: d.key,
              };
            })
        ),
        'key'
      )
    ).map(([k, v]) => ({
      key: k,
      chains: _.uniq(v.map(d => d.chain)),
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
    })),
    ['num_txs', 'volume', 'key'],
    ['desc', 'desc', 'asc']
  );
}

export function processTVLData(
  tvlData: TVLData[],
  assets: AssetData[],
  itsAssets: ITSAssetData[]
): TVLData[] {
  return (toArray(tvlData) as TVLData[]).map((d: TVLData) => {
    const assetData =
      d.assetType === 'its'
        ? getITSAssetData(d.asset, itsAssets)
        : getAssetData(d.asset, assets) ||
          ((d.total_on_contracts || 0) > 0 || (d.total_on_tokens || 0) > 0
            ? {
                ...Object.values(d.tvl || {}).find(
                  (tvlItem: TVLItem) => tvlItem?.contract_data?.is_custom
                )?.contract_data,
              }
            : undefined);
    d.price = toNumber(
      isNumber(d.price)
        ? d.price
        : isNumber(assetData?.price)
          ? assetData.price
          : -1
    );

    return { ...d, value: toNumber(d.total) * d.price };
  });
}

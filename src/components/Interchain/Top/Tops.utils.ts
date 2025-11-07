import _ from 'lodash';

import accounts from '@/data/accounts';
import { getChainData, getITSAssetData } from '@/lib/config';
import { toArray, toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import {
  ChainData,
  ChainWithContracts,
  ContractData,
  GroupDataItem,
  ITSAssetData,
  SourceChainData,
  TopDataItem,
  TransferStatsItem,
} from '../Interchain.types';

// Constants
const GROUP_BY_KEY = 'key';
const GROUP_BY_CUSTOM_KEY = 'customKey';

/**
 * Finds account name by address
 */
function findAccountName(address?: string): string | undefined {
  if (!address) return undefined;
  return accounts.find(a => equalsIgnoreCase(a.address, address))?.name;
}

/**
 * Groups data by a key field
 */
export function groupData(
  data: GroupDataItem[],
  chains: ChainData[],
  by = GROUP_BY_KEY
): GroupDataItem[] {
  return Object.entries(_.groupBy(toArray(data) as GroupDataItem[], by)).map(
    ([k, v]) => ({
      key: (v[0] as GroupDataItem)?.key || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === GROUP_BY_CUSTOM_KEY
                ? (v[0] as GroupDataItem)?.chain
                : (v as GroupDataItem[]).map((d: GroupDataItem) => d.chain)
            ) as (string | string[] | undefined)[]
          ).map((d: string | string[] | undefined) =>
            getChainData(d as string, chains)
          )
        ),
        ['i'],
        ['asc']
      ).map(d => d.id),
    })
  );
}

/**
 * Gets top N items from data ordered by field
 */
export function getTopData(
  data: GroupDataItem[],
  field = 'num_txs',
  n = 5
): GroupDataItem[] {
  return _.slice(
    _.orderBy(toArray(data) as GroupDataItem[], [field], ['desc']),
    0,
    n
  );
}

/**
 * Helper to extract GMP destination chains data
 */
function extractGMPDestinationChains(sourceChains: SourceChainData[]): Array<{
  sourceKey: string;
  destKey: string;
  num_txs?: number;
  volume?: number;
}> {
  return (toArray(sourceChains) as SourceChainData[]).flatMap(
    (s: SourceChainData) =>
      (
        toArray(s.destination_chains) as Array<{
          key: string;
          num_txs?: number;
          volume?: number;
        }>
      ).map(d => ({
        sourceKey: s.key,
        destKey: d.key,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
  );
}

/**
 * Helper to extract transfers stats data
 */
function extractTransfersStats(transfersStats?: {
  data?: TransferStatsItem[];
}): TransferStatsItem[] {
  return toArray(
    transfersStats?.data as TransferStatsItem[]
  ) as TransferStatsItem[];
}

/**
 * Processes chain pairs from GMP and transfers data
 */
export function processChainPairs(
  data: {
    GMPStatsByChains?: {
      source_chains?: SourceChainData[];
    };
    transfersStats?: {
      data?: TransferStatsItem[];
    };
  },
  chains: ChainData[]
): GroupDataItem[] {
  const gmpData = extractGMPDestinationChains(
    toArray(data.GMPStatsByChains?.source_chains) as SourceChainData[]
  ).map(d => ({
    key: `${d.sourceKey}_${d.destKey}`,
    num_txs: d.num_txs,
    volume: d.volume,
  }));

  const transfersData = extractTransfersStats(data.transfersStats).map(
    (d: TransferStatsItem) => ({
      key: `${d.source_chain}_${d.destination_chain}`,
      num_txs: d.num_txs,
      volume: d.volume,
    })
  );

  return groupData(_.concat(gmpData, transfersData), chains);
}

/**
 * Processes source chains from GMP and transfers data
 */
export function processSourceChains(
  data: {
    GMPStatsByChains?: {
      source_chains?: SourceChainData[];
    };
    transfersStats?: {
      data?: TransferStatsItem[];
    };
  },
  chains: ChainData[]
): GroupDataItem[] {
  const gmpData = extractGMPDestinationChains(
    toArray(data.GMPStatsByChains?.source_chains) as SourceChainData[]
  ).map(d => ({
    key: d.sourceKey,
    num_txs: d.num_txs,
    volume: d.volume,
  }));

  const transfersData = extractTransfersStats(data.transfersStats).map(
    (d: TransferStatsItem) => ({
      key: d.source_chain,
      num_txs: d.num_txs,
      volume: d.volume,
    })
  );

  return groupData(_.concat(gmpData, transfersData), chains);
}

/**
 * Processes destination chains from GMP and transfers data
 */
export function processDestinationChains(
  data: {
    GMPStatsByChains?: {
      source_chains?: SourceChainData[];
    };
    transfersStats?: {
      data?: TransferStatsItem[];
    };
  },
  chains: ChainData[]
): GroupDataItem[] {
  const gmpData = extractGMPDestinationChains(
    toArray(data.GMPStatsByChains?.source_chains) as SourceChainData[]
  ).map(d => ({
    key: d.destKey,
    num_txs: d.num_txs,
    volume: d.volume,
  }));

  const transfersData = extractTransfersStats(data.transfersStats).map(
    (d: TransferStatsItem) => ({
      key: d.destination_chain,
      num_txs: d.num_txs,
      volume: d.volume,
    })
  );

  return groupData(_.concat(gmpData, transfersData), chains);
}

/**
 * Processes transfers users data with account names
 */
export function processTransfersUsers(
  data: TopDataItem[],
  chains: ChainData[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as TopDataItem[]).map((d: TopDataItem) => {
      const name = findAccountName(d.key);

      return {
        key: d.key || '',
        customKey: name || d.key || '',
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    GROUP_BY_CUSTOM_KEY
  );
}

/**
 * Processes GMP contracts data with account names
 */
export function processContracts(
  data: ChainWithContracts[],
  chains: ChainData[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as ChainWithContracts[]).flatMap((d: ChainWithContracts) =>
      (toArray(d.contracts as ContractData[]) as ContractData[]).map(
        (c: ContractData) => {
          const name = findAccountName(c.key);
          const lowerKey = toCase(c.key, 'lower');

          return {
            key: lowerKey,
            customKey: name || lowerKey,
            num_txs: c.num_txs,
            volume: c.volume,
            chain: d.key,
          };
        }
      )
    ),
    chains,
    GROUP_BY_CUSTOM_KEY
  );
}

/**
 * Processes GMP users data with account names
 */
export function processGMPUsers(
  data: TopDataItem[],
  chains: ChainData[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as TopDataItem[]).map((d: TopDataItem) => {
      const name = findAccountName(d.key);
      const lowerKey = toCase(d.key, 'lower');

      return {
        key: lowerKey,
        customKey: name || lowerKey,
        num_txs: d.num_txs,
      };
    }),
    chains,
    GROUP_BY_CUSTOM_KEY
  );
}

/**
 * Filters data by volume if needed
 */
function filterByVolume(
  data: TopDataItem[],
  includeVolume: boolean
): TopDataItem[] {
  if (!includeVolume) return data;
  return data.filter((d: TopDataItem) => (d.volume || 0) > 0);
}

/**
 * Processes ITS users data with account names
 */
export function processITSUsers(
  data: TopDataItem[],
  chains: ChainData[],
  includeVolume = false
): GroupDataItem[] {
  const processedData = filterByVolume(
    toArray(data) as TopDataItem[],
    includeVolume
  );

  return groupData(
    processedData.map((d: TopDataItem) => {
      const name = findAccountName(d.key);
      const lowerKey = toCase(d.key, 'lower');

      return {
        key: lowerKey,
        customKey: name || lowerKey,
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    GROUP_BY_CUSTOM_KEY
  );
}

/**
 * Processes ITS assets data with symbol names
 */
export function processITSAssets(
  data: TopDataItem[],
  chains: ChainData[],
  itsAssets: ITSAssetData[],
  includeVolume = false
): GroupDataItem[] {
  const processedData = filterByVolume(
    toArray(data) as TopDataItem[],
    includeVolume
  );

  return groupData(
    processedData.map((d: TopDataItem) => {
      const { symbol } = { ...getITSAssetData(d.key, itsAssets) };
      const lowerKey = toCase(d.key, 'lower');

      return {
        key: lowerKey,
        customKey: symbol || lowerKey,
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    GROUP_BY_CUSTOM_KEY
  );
}

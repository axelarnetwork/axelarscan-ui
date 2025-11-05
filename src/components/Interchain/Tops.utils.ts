import _ from 'lodash';

import { getAssetData, getChainData, getITSAssetData } from '@/lib/config';
import { toArray, toCase } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import accounts from '@/data/accounts';
import {
  ChainWithContracts,
  ContractData,
  GroupDataItem,
  SourceChainData,
  TopDataItem,
  TransferStatsItem,
} from './Interchain.types';

/**
 * Groups data by a key field
 */
export function groupData(
  data: GroupDataItem[],
  chains: any[],
  by = 'key'
): GroupDataItem[] {
  return Object.entries(_.groupBy(toArray(data), by)).map(([k, v]) => ({
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
  chains: any[]
): GroupDataItem[] {
  return groupData(
    _.concat(
      (
        toArray(
          data.GMPStatsByChains?.source_chains as SourceChainData[]
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
        toArray(data.transfersStats?.data as TransferStatsItem[]) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: `${d.source_chain}_${d.destination_chain}`,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    ),
    chains
  );
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
  chains: any[]
): GroupDataItem[] {
  return groupData(
    _.concat(
      (
        toArray(
          data.GMPStatsByChains?.source_chains as SourceChainData[]
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
        toArray(data.transfersStats?.data as TransferStatsItem[]) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.source_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    ),
    chains
  );
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
  chains: any[]
): GroupDataItem[] {
  return groupData(
    _.concat(
      (
        toArray(
          data.GMPStatsByChains?.source_chains as SourceChainData[]
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
        toArray(data.transfersStats?.data as TransferStatsItem[]) as TransferStatsItem[]
      ).map((d: TransferStatsItem) => ({
        key: d.destination_chain,
        num_txs: d.num_txs,
        volume: d.volume,
      }))
    ),
    chains
  );
}

/**
 * Processes transfers users data with account names
 */
export function processTransfersUsers(
  data: TopDataItem[],
  chains: any[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as TopDataItem[]).map((d: TopDataItem) => {
      const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
      const name = account?.name;

      return {
        key: d.key || '',
        customKey: name || d.key || '',
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    'customKey'
  );
}

/**
 * Processes GMP contracts data with account names
 */
export function processContracts(
  data: ChainWithContracts[],
  chains: any[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as ChainWithContracts[]).flatMap((d: ChainWithContracts) =>
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
    chains,
    'customKey'
  );
}

/**
 * Processes GMP users data with account names
 */
export function processGMPUsers(
  data: TopDataItem[],
  chains: any[]
): GroupDataItem[] {
  return groupData(
    (toArray(data) as TopDataItem[]).map((d: TopDataItem) => {
      const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
      const name = account?.name;

      return {
        key: toCase(d.key, 'lower'),
        customKey: name || toCase(d.key, 'lower'),
        num_txs: d.num_txs,
      };
    }),
    chains,
    'customKey'
  );
}

/**
 * Processes ITS users data with account names
 */
export function processITSUsers(
  data: TopDataItem[],
  chains: any[],
  includeVolume = false
): GroupDataItem[] {
  let processedData = toArray(data) as TopDataItem[];

  if (includeVolume) {
    processedData = processedData.filter((d: TopDataItem) => (d.volume || 0) > 0);
  }

  return groupData(
    processedData.map((d: TopDataItem) => {
      const account = accounts.find(a => equalsIgnoreCase(a.address, d.key));
      const name = account?.name;

      return {
        key: toCase(d.key, 'lower'),
        customKey: name || toCase(d.key, 'lower'),
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    'customKey'
  );
}

/**
 * Processes ITS assets data with symbol names
 */
export function processITSAssets(
  data: TopDataItem[],
  chains: any[],
  itsAssets: any[],
  includeVolume = false
): GroupDataItem[] {
  let processedData = toArray(data) as TopDataItem[];

  if (includeVolume) {
    processedData = processedData.filter((d: TopDataItem) => (d.volume || 0) > 0);
  }

  return groupData(
    processedData.map((d: TopDataItem) => {
      const { symbol } = { ...getITSAssetData(d.key, itsAssets) };

      return {
        key: toCase(d.key, 'lower'),
        customKey: symbol || toCase(d.key, 'lower'),
        num_txs: d.num_txs,
        volume: d.volume,
      };
    }),
    chains,
    'customKey'
  );
}


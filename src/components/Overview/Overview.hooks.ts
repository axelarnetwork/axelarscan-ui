import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useChains, useStats } from '@/hooks/useGlobalData';
import {
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import { transfersStats, transfersTotalVolume } from '@/lib/api/token-transfer';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { find } from '@/lib/string';
import { toNumber } from '@/lib/number';
import type {
  NetworkGraphDataItem,
  OverviewData,
  SourceChainEntry,
  DestinationChainEntry,
  TransferStatsEntry,
} from './Overview.types';

async function resolveMetric(
  key: string,
  stats: Record<string, unknown> | null
): Promise<[string, unknown]> {
  const cached = stats?.[key];
  switch (key) {
    case 'GMPStatsByChains':
      return [
        key,
        {
          ...((cached as Record<string, unknown>) ||
            (await GMPStatsByChains())),
        },
      ];
    case 'GMPStatsByContracts':
      return [
        key,
        {
          ...((cached as Record<string, unknown>) ||
            (await GMPStatsByContracts())),
        },
      ];
    case 'GMPTotalVolume':
      return [key, toNumber(cached || (await GMPTotalVolume()))];
    case 'transfersStats':
      return [
        key,
        {
          ...((cached as Record<string, unknown>) || (await transfersStats())),
        },
      ];
    case 'transfersTotalVolume':
      return [key, toNumber(cached || (await transfersTotalVolume()))];
    default:
      return [key, undefined];
  }
}

const METRIC_KEYS = [
  'GMPStatsByChains',
  'GMPStatsByContracts',
  'GMPTotalVolume',
  'transfersStats',
  'transfersTotalVolume',
];

function resolveChainId(
  key: string,
  lookup: Record<string, string | undefined>,
  chains: ReturnType<typeof useChains>
): string {
  const cached = lookup[key] || getChainData(key, chains)?.id;
  lookup[key] = cached;
  return cached || key;
}

function buildGmpGraphItems(
  data: OverviewData,
  lookup: Record<string, string | undefined>,
  chains: ReturnType<typeof useChains>
): NetworkGraphDataItem[] {
  return (
    toArray(data.GMPStatsByChains?.source_chains) as SourceChainEntry[]
  ).flatMap((s: SourceChainEntry) =>
    (toArray(s.destination_chains) as DestinationChainEntry[]).map(
      (dc: DestinationChainEntry) => {
        const sourceChain = resolveChainId(s.key, lookup, chains);
        const destinationChain = resolveChainId(dc.key, lookup, chains);
        return {
          id: toArray([sourceChain, destinationChain]).join('_'),
          sourceChain,
          destinationChain,
          num_txs: dc.num_txs ?? 0,
          volume: dc.volume,
        };
      }
    )
  );
}

function buildTransferGraphItems(
  data: OverviewData,
  lookup: Record<string, string | undefined>,
  chains: ReturnType<typeof useChains>
): NetworkGraphDataItem[] {
  return (toArray(data.transfersStats?.data) as TransferStatsEntry[]).map(
    (t: TransferStatsEntry) => {
      const sourceChain = resolveChainId(t.source_chain, lookup, chains);
      const destinationChain = resolveChainId(
        t.destination_chain,
        lookup,
        chains
      );
      return {
        id: toArray([sourceChain, destinationChain]).join('_'),
        sourceChain,
        destinationChain,
        num_txs: t.num_txs ?? 0,
        volume: t.volume,
      };
    }
  );
}

function buildNetworkGraphData(
  data: OverviewData,
  chains: ReturnType<typeof useChains>
): NetworkGraphDataItem[] {
  const lookup: Record<string, string | undefined> = {};
  const gmpItems = buildGmpGraphItems(data, lookup, chains);
  const transferItems = buildTransferGraphItems(data, lookup, chains);

  const combined = toArray(_.concat(gmpItems, transferItems)).filter(
    (d): d is NetworkGraphDataItem =>
      !!(d as NetworkGraphDataItem)?.sourceChain &&
      !!(d as NetworkGraphDataItem)?.destinationChain
  );

  const grouped = _.groupBy(combined, 'id');
  return _.orderBy(
    Object.entries(grouped).map(([k, v]) => ({
      ...v[0],
      id: k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
    })),
    ['num_txs'],
    ['desc']
  );
}

export function useOverviewData() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [networkGraph, setNetworkGraph] = useState<
    NetworkGraphDataItem[] | null
  >(null);
  const [chainFocus, setChainFocus] = useState<string | null>(null);
  const chains = useChains();
  const stats = useStats();

  useEffect(() => {
    const getData = async () => {
      if (!chains) return;
      const entries = await Promise.all(
        METRIC_KEYS.map(key =>
          resolveMetric(key, stats as Record<string, unknown> | null)
        )
      );
      setData(Object.fromEntries(entries));
    };
    getData();
  }, [setData, chains, stats]);

  useEffect(() => {
    const getData = async () => {
      if (!data) return;
      setNetworkGraph(buildNetworkGraphData(data, chains));
    };
    getData();
  }, [data, setNetworkGraph, chains]);

  return { data, networkGraph, chainFocus, setChainFocus, chains };
}

export function useChainPairs(
  data: OverviewData | null,
  chainFocus: string | null,
  chains: ReturnType<typeof useChains>
) {
  const groupData = (items: Record<string, unknown>[], by = 'key') =>
    Object.entries(_.groupBy(toArray(items), by)).map(([k, v]) => ({
      key: ((v[0] as Record<string, unknown>)?.key as string) || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(
              by === 'customKey'
                ? (v[0] as Record<string, unknown>)?.chain
                : v.map(d => (d as Record<string, unknown>).chain)
            )
          ).map(d => getChainData(d as string, chains))
        ),
        ['i'],
        ['asc']
      ).map(d => d?.id),
    }));

  return groupData(
    _.concat(
      toArray(data?.GMPStatsByChains?.source_chains).flatMap(
        (s: SourceChainEntry) =>
          toArray(s.destination_chains)
            .filter(
              (d: DestinationChainEntry) =>
                !chainFocus || find(chainFocus, [s.key, d.key])
            )
            .map((d: DestinationChainEntry) => ({
              key: `${s.key}_${d.key}`,
              num_txs: d.num_txs,
              volume: d.volume,
            }))
      ),
      toArray(data?.transfersStats?.data)
        .filter(
          (d: TransferStatsEntry) =>
            !chainFocus ||
            find(chainFocus, [d.source_chain, d.destination_chain])
        )
        .map((d: TransferStatsEntry) => ({
          key: `${d.source_chain}_${d.destination_chain}`,
          num_txs: d.num_txs,
          volume: d.volume,
        }))
    )
  );
}

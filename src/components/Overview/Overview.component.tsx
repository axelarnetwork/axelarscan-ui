'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { PiRadioButtonFill } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Summary, SankeyChart } from '@/components/Interchain';
import { NetworkGraph } from '@/components/NetworkGraph';
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
import { Metrics } from './Metrics.component';
import type {
  NetworkGraphDataItem,
  OverviewData,
  SourceChainEntry,
  DestinationChainEntry,
  TransferStatsEntry,
} from './Overview.types';
import * as styles from './Overview.styles';

const SANKEY_TABS = ['transactions', 'volume'];

export function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [networkGraph, setNetworkGraph] = useState<NetworkGraphDataItem[] | null>(null);
  const [chainFocus, setChainFocus] = useState<string | null>(null);
  const [sankeyTab, setSankeyTab] = useState(SANKEY_TABS[0]);
  const chains = useChains();
  const stats = useStats();

  // stats
  useEffect(() => {
    const metrics = [
      'GMPStatsByChains',
      'GMPStatsByContracts',
      'GMPTotalVolume',
      'transfersStats',
      'transfersTotalVolume',
    ];

    const getData = async () => {
      if (!chains) return;

      setData(
        Object.fromEntries(
          await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            metrics.map(
                d =>
                  new Promise<[string, unknown]>(async resolve => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const s = stats as any;
                    switch (d) {
                      case 'GMPStatsByChains':
                        resolve([
                          d,
                          { ...(s?.[d] || (await GMPStatsByChains())) },
                        ]);
                        break;
                      case 'GMPStatsByContracts':
                        resolve([
                          d,
                          {
                            ...(s?.[d] || (await GMPStatsByContracts())),
                          },
                        ]);
                        break;
                      case 'GMPTotalVolume':
                        resolve([
                          d,
                          toNumber(s?.[d] || (await GMPTotalVolume())),
                        ]);
                        break;
                      case 'transfersStats':
                        resolve([
                          d,
                          { ...(s?.[d] || (await transfersStats())) },
                        ]);
                        break;
                      case 'transfersTotalVolume':
                        resolve([
                          d,
                          toNumber(
                            s?.[d] || (await transfersTotalVolume())
                          ),
                        ]);
                        break;
                      default:
                        resolve([d, undefined]);
                        break;
                    }
                  })
              )
          )
        )
      );
    };

    getData();
  }, [setData, chains, stats]);

  useEffect(() => {
    const getData = async () => {
      if (!data) return;

      const chainIdsLookup: Record<string, string | undefined> = {};

      setNetworkGraph(
        _.orderBy(
          Object.entries(
            _.groupBy(
              toArray(
                _.concat(
                  (
                    await Promise.all(
                      ['gmp', 'transfers'].map(
                        d =>
                          new Promise<NetworkGraphDataItem[] | undefined>(async resolve => {
                            switch (d) {
                              case 'gmp':
                                resolve(
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (toArray(
                                    data.GMPStatsByChains?.source_chains
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  ) as any[]).flatMap((s: SourceChainEntry) =>
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    (toArray(s.destination_chains) as any[]).map((dc: DestinationChainEntry) => {
                                      let sourceChain =
                                        chainIdsLookup[s.key] ||
                                        getChainData(s.key, chains)?.id;
                                      chainIdsLookup[s.key] = sourceChain;

                                      if (!sourceChain) {
                                        sourceChain = s.key;
                                      }

                                      let destinationChain =
                                        chainIdsLookup[dc.key] ||
                                        getChainData(dc.key, chains)?.id;
                                      chainIdsLookup[dc.key] =
                                        destinationChain;

                                      if (!destinationChain) {
                                        destinationChain = dc.key;
                                      }

                                      return {
                                        id: toArray([
                                          sourceChain,
                                          destinationChain,
                                        ]).join('_'),
                                        sourceChain,
                                        destinationChain,
                                        num_txs: dc.num_txs ?? 0,
                                        volume: dc.volume,
                                      };
                                    })
                                  )
                                );
                                break;
                              case 'transfers':
                                resolve(
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  (toArray(data.transfersStats?.data) as any[]).map(
                                    (t: TransferStatsEntry) => {
                                      let sourceChain =
                                        chainIdsLookup[t.source_chain] ||
                                        getChainData(t.source_chain, chains)
                                          ?.id;
                                      chainIdsLookup[t.source_chain] =
                                        sourceChain;

                                      if (!sourceChain) {
                                        sourceChain = t.source_chain;
                                      }

                                      let destinationChain =
                                        chainIdsLookup[t.destination_chain] ||
                                        getChainData(
                                          t.destination_chain,
                                          chains
                                        )?.id;
                                      chainIdsLookup[t.destination_chain] =
                                        destinationChain;

                                      if (!destinationChain) {
                                        destinationChain =
                                          t.destination_chain;
                                      }

                                      return {
                                        id: toArray([
                                          sourceChain,
                                          destinationChain,
                                        ]).join('_'),
                                        sourceChain,
                                        destinationChain,
                                        num_txs: t.num_txs ?? 0,
                                        volume: t.volume,
                                      };
                                    }
                                  )
                                );
                                break;
                              default:
                                resolve(undefined);
                                break;
                            }
                          })
                      )
                    )
                  ).flatMap((d) => d)
                )
              ).filter((d): d is NetworkGraphDataItem => !!(d as NetworkGraphDataItem)?.sourceChain && !!(d as NetworkGraphDataItem)?.destinationChain),
              'id'
            )
          ).map(([k, v]) => ({
            ...v[0],
            id: k,
            num_txs: _.sumBy(v, 'num_txs'),
            volume: _.sumBy(v, 'volume'),
          })),
          ['num_txs'],
          ['desc']
        )
      );
    };

    getData();
  }, [data, setNetworkGraph, chains]);

  const groupData = (items: Record<string, unknown>[], by = 'key') =>
    Object.entries(_.groupBy(toArray(items), by)).map(([k, v]) => ({
      key: (v[0] as Record<string, unknown>)?.key as string || k,
      num_txs: _.sumBy(v, 'num_txs'),
      volume: _.sumBy(v, 'volume'),
      chain: _.orderBy(
        toArray(
          _.uniq(
            toArray(by === 'customKey' ? (v[0] as Record<string, unknown>)?.chain : v.map((d) => (d as Record<string, unknown>).chain))
          ).map((d) => getChainData(d as string, chains))
        ),
        ['i'],
        ['asc']
      ).map((d) => d?.id),
    }));

  const chainPairs = groupData(
    _.concat(
      toArray(data?.GMPStatsByChains?.source_chains).flatMap((s: SourceChainEntry) =>
        toArray(s.destination_chains)
          .filter((d: DestinationChainEntry) => !chainFocus || find(chainFocus, [s.key, d.key]))
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

  return (
    <>
      <Metrics />
      <Container className="mt-8">
        {!data ? (
          <Spinner />
        ) : (
          <div className={styles.contentWrapper}>
            <div className={styles.sectionWrapper}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Cross-Chain Activity</h2>
                {chains && (
                  <Tag className={styles.connectedChainsTag}>
                    <PiRadioButtonFill
                      size={18}
                      className={styles.connectedChainsIcon}
                    />
                    <span className={styles.connectedChainsLabel}>
                      Connected chains:{' '}
                      <span className={styles.connectedChainsCount}>
                        {
                          chains.filter(
                            (d) =>
                              !d.deprecated &&
                              (!d.maintainer_id || d.gateway?.address)
                          ).length
                        }
                      </span>
                    </span>
                  </Tag>
                )}
              </div>
              <Summary data={data} params={{}} />
            </div>
            <div className={styles.sectionWrapper}>
              <h2 className={styles.sectionTitle}>Network Graph</h2>
              <div className={styles.networkGraphGrid}>
                <div className={styles.networkGraphCol}>
                  <NetworkGraph
                    data={networkGraph}
                    hideTable={true}
                    setChainFocus={(chain: string | null) => setChainFocus(chain)}
                  />
                </div>
                <div className={styles.sankeyWrapper}>
                  <SankeyChart
                    i={0}
                    data={chainPairs}
                    topN={40}
                    totalValue={
                      sankeyTab === 'transactions'
                        ? toNumber(
                            _.sumBy(
                              data.GMPStatsByChains?.source_chains,
                              'num_txs'
                            )
                          ) + toNumber(data.transfersStats?.total)
                        : toNumber(data.GMPTotalVolume) +
                          toNumber(data.transfersTotalVolume)
                    }
                    field={sankeyTab === 'transactions' ? 'num_txs' : 'volume'}
                    title={
                      (<div className={styles.sankeyTabsWrapper}>
                        {SANKEY_TABS.map((d, i) => (
                          <div
                            key={i}
                            onClick={() => setSankeyTab(d)}
                            className={clsx(
                              styles.sankeyTabBase,
                              d === sankeyTab
                                ? styles.sankeyTabActive
                                : styles.sankeyTabInactive,
                              i > 0 ? 'ml-4' : ''
                            )}
                          >
                            <span>{d}</span>
                          </div>
                        ))}
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      </div>) as any
                    }
                    valuePrefix={sankeyTab === 'transactions' ? '' : '$'}
                    noBorder={true}
                    className="h-144"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

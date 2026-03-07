'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdLocalGasStation } from 'react-icons/md';
import { PiRadioButtonFill } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Summary, SankeyChart } from '@/components/Interchain';
import { NetworkGraph } from '@/components/NetworkGraph';
import { useChains, useValidators, useInflationData, useNetworkParameters, useStats } from '@/hooks/useGlobalData';
import { getRPCStatus } from '@/lib/api/validator';
import {
  GMPStatsByChains,
  GMPStatsByContracts,
  GMPTotalVolume,
} from '@/lib/api/gmp';
import { transfersStats, transfersTotalVolume } from '@/lib/api/token-transfer';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { find } from '@/lib/string';
import { isNumber, toNumber, formatUnits } from '@/lib/number';
import * as styles from './Overview.styles';

interface NetworkGraphDataItem {
  id: string;
  sourceChain: string;
  destinationChain: string;
  num_txs: number;
  volume?: number;
  [key: string]: unknown;
}

interface SourceChainEntry {
  key: string;
  destination_chains?: DestinationChainEntry[];
  [key: string]: unknown;
}

interface DestinationChainEntry {
  key: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

interface TransferStatsEntry {
  source_chain: string;
  destination_chain: string;
  num_txs?: number;
  volume?: number;
  [key: string]: unknown;
}

interface OverviewData {
  GMPStatsByChains?: { source_chains?: SourceChainEntry[]; [key: string]: unknown };
  GMPStatsByContracts?: Record<string, unknown>;
  GMPTotalVolume?: number;
  transfersStats?: { data?: TransferStatsEntry[]; total?: number; [key: string]: unknown };
  transfersTotalVolume?: number;
  [key: string]: unknown;
}

function Metrics() {
  const [blockData, setBlockData] = useState<{
    latest_block_height?: number;
    avg_block_time?: number;
  } | null>(null);
  const chains = useChains();
  const validators = useValidators();
  const inflationData = useInflationData();
  const networkParameters = useNetworkParameters();

  useEffect(() => {
    const getData = async () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBlockData(await getRPCStatus({ avg_block_time: true }) as any);

    getData();

    const interval = setInterval(() => getData(), 6 * 1000);
    return () => clearInterval(interval);
  }, [setBlockData]);

  const externalChainVotingInflationRate = inflationData?.externalChainVotingInflationRate;
  const evmRewardPercent = isNumber(externalChainVotingInflationRate)
    ? externalChainVotingInflationRate * 100
    : 0.2;

  const { symbol } = {
    ...(getChainData('axelarnet', chains)?.native_token as { symbol?: string } | undefined),
  };

  return (
    blockData && (
      <div className={styles.metricsWrapper}>
        <div className={styles.metricsInner}>
          {blockData.latest_block_height && (
            <div className={styles.metricRow}>
              <div className={styles.metricLabelWhitespace}>
                Latest Block:
              </div>
              <Link
                href={`/block/${blockData.latest_block_height}`}
                target="_blank"
                className={styles.metricLink}
              >
                <Number
                  value={blockData.latest_block_height}
                  className={styles.metricValue}
                />
              </Link>
              {blockData.avg_block_time && (
                <Number
                  value={blockData.avg_block_time}
                  prefix="("
                  suffix="s)"
                  className={styles.metricSecondary}
                />
              )}
            </div>
          )}
          <span className={styles.separator}>|</span>
          <div className={styles.metricItemsGroup}>
            {toArray(validators).length > 0 && (
              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  Validators:
                </div>
                <Link
                  href="/validators"
                  target="_blank"
                  className={styles.metricLink}
                >
                  <Number
                    value={
                      validators!.filter((d) => d.status === 'BOND_STATUS_BONDED')
                        .length
                    }
                    className={styles.metricValue}
                  />
                </Link>
              </div>
            )}
            <div className={styles.metricRow}>
              <div className={styles.metricLabel}>
                Threshold:
              </div>
              <Link
                href="https://axelar.network/blog/axelar-governance-explained"
                target="_blank"
                className={styles.metricLink}
              >
                <div className={styles.tooltipDesktopOnly}>
                  <Tooltip
                    content="Threshold number of quadratic voting power required to onboard a new EVM chain"
                    className={styles.tooltipWhitespace}
                  >
                    <Number
                      value={60}
                      prefix=">"
                      suffix="%"
                      className={styles.metricValue}
                    />
                  </Tooltip>
                </div>
                <div className={styles.mobileOnly}>
                  <div className={styles.mobileInner}>
                    <Number
                      value={60}
                      prefix=">"
                      suffix="%"
                      className={styles.metricValue}
                    />
                  </div>
                </div>
              </Link>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.metricLabel}>
                Rewards:
              </div>
              <Link
                href="https://axelar.network/blog/axelar-governance-explained"
                target="_blank"
                className={styles.metricLink}
              >
                <div className={styles.tooltipDesktopOnly}>
                  <Tooltip
                    content="Base inflation rate + Additional chain rewards"
                    className={styles.tooltipWhitespace}
                  >
                    <Number
                      value={evmRewardPercent}
                      prefix="1% base + "
                      suffix="% / EVM chain"
                      className={styles.metricValue}
                    />
                  </Tooltip>
                </div>
                <div className={styles.mobileOnly}>
                  <div className={styles.mobileInner}>
                    <Number
                      value={evmRewardPercent}
                      prefix="1% base + "
                      suffix="% / EVM chain"
                      className={styles.metricValue}
                    />
                  </div>
                </div>
              </Link>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.gasLabelWrapper}>
                <MdLocalGasStation size={16} />
                <span>Unit:</span>
              </div>
              <Link
                href="https://axelar.network/blog/axelar-governance-explained"
                target="_blank"
                className={styles.metricLink}
              >
                <div className={styles.tooltipDesktopOnly}>
                  <Tooltip
                    content="AXL gas fees per transaction"
                    className={styles.tooltipWhitespace}
                  >
                    <Number
                      value={0.007}
                      suffix=" uaxl"
                      className={styles.metricValue}
                    />
                  </Tooltip>
                </div>
                <div className={styles.mobileOnly}>
                  <div className={styles.mobileInner}>
                    <Number
                      value={0.007}
                      suffix=" uaxl"
                      className={styles.metricValue}
                    />
                  </div>
                </div>
              </Link>
            </div>
            <div className={styles.metricRow}>
              <div className={styles.gasLabelWrapper}>
                <MdLocalGasStation size={16} />
                <span className={styles.metricLabelWhitespace}>Per Transfer:</span>
              </div>
              <Link
                href="https://axelar.network/blog/axelar-governance-explained"
                target="_blank"
                className={styles.metricLink}
              >
                <div className={styles.tooltipDesktopOnly}>
                  <Tooltip
                    content="AXL gas fees per transaction"
                    className={styles.tooltipWhitespace}
                  >
                    <Number
                      value={0.0014}
                      suffix={` ${symbol}`}
                      className={styles.metricValue}
                    />
                  </Tooltip>
                </div>
                <div className={styles.mobileOnly}>
                  <div className={styles.mobileInner}>
                    <Number
                      value={0.0014}
                      suffix={` ${symbol}`}
                      className={styles.metricValue}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <span className={styles.separator}>|</span>
          {networkParameters?.bankSupply?.amount &&
            networkParameters.stakingPool?.bonded_tokens && (
              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  Staked:
                </div>
                <Link
                  href="/validators"
                  target="_blank"
                  className={styles.metricLink}
                >
                  <Number
                    value={formatUnits(
                      networkParameters.stakingPool.bonded_tokens,
                      6
                    )}
                    format="0,0a"
                    noTooltip={true}
                    className={styles.metricValue}
                  />
                  <Number
                    value={formatUnits(networkParameters.bankSupply.amount, 6)}
                    format="0,0.00a"
                    prefix="/ "
                    noTooltip={true}
                    className={styles.stakedValueExtra}
                  />
                </Link>
              </div>
            )}
          {inflationData && inflationData.inflation != null && inflationData.inflation > 0 && (
            <>
              {networkParameters?.bankSupply?.amount &&
                networkParameters.stakingPool?.bonded_tokens && (
                  <div className={styles.metricRow}>
                    <div className={styles.metricLabel}>
                      APR:
                    </div>
                    <Link
                      href="https://wallet.keplr.app/chains/axelar"
                      target="_blank"
                      className={styles.metricLink}
                    >
                      <Number
                        value={
                          (inflationData!.inflation! *
                            100 *
                            (formatUnits(
                              networkParameters.bankSupply!.amount,
                              6
                            ) as number) *
                            (1 - inflationData!.communityTax!) *
                            (1 - 0.05)) /
                          (formatUnits(
                            networkParameters.stakingPool!.bonded_tokens,
                            6
                          ) as number)
                        }
                        suffix="%"
                        noTooltip={true}
                        className={styles.metricValue}
                      />
                    </Link>
                  </div>
                )}
              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  Inflation:
                </div>
                <Link
                  href="/validators"
                  target="_blank"
                  className={styles.metricLink}
                >
                  <Number
                    value={inflationData.inflation * 100}
                    suffix="%"
                    noTooltip={true}
                    className={styles.metricValue}
                  />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    )
  );
}

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
      if (chains) {
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
      }
    };

    getData();
  }, [setData, chains, stats]);

  useEffect(() => {
    const getData = async () => {
      if (data) {
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
      }
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

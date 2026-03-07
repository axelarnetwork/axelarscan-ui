'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { TablePagination } from '@/components/Pagination';
import { useChains, useVerifiers, useVerifiersByChain } from '@/hooks/useGlobalData';
import {
  getRPCStatus,
  searchAmplifierPolls,
  searchAmplifierProofs,
  getVerifiersRewards,
  searchVerifiersRewards,
} from '@/lib/api/validator';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase } from '@/lib/string';
import { isNumber, numberFormat } from '@/lib/number';
import * as styles from './Verifier.styles';

interface VerifierPollEntry {
  id?: string;
  height?: number;
  sender_chain?: string;
  poll_id?: string;
  vote?: boolean;
  [key: string]: unknown;
}

interface VerifierSignEntry {
  id?: string;
  height?: number;
  chain?: string;
  destination_chain?: string;
  session_id?: string;
  sign?: boolean;
  [key: string]: unknown;
}

interface RewardEntry {
  height?: number;
  chain?: string;
  amount?: number;
  created_at?: { ms?: number };
  [key: string]: unknown;
}

interface CumulativeRewardsData {
  total_rewards?: number;
  chains?: RewardEntry[];
  [key: string]: unknown;
}

interface VerifierBondingState {
  Bonded?: { amount?: number; [key: string]: unknown };
  [key: string]: unknown;
}

interface VerifierChainEntry {
  address?: string;
  bonding_state?: VerifierBondingState;
  authorization_state?: string;
  weight?: number;
  [key: string]: unknown;
}

interface VerifierData {
  address?: string;
  supportedChains?: string[];
  status?: string;
  code?: number;
  message?: string;
  [key: string]: unknown;
}

interface InfoProps {
  data: VerifierData;
  address: string;
  rewards: RewardEntry[] | null;
  cumulativeRewards: CumulativeRewardsData | null;
}

function Info({ data, address, rewards, cumulativeRewards }: InfoProps) {
  const rewardsSizePerPage = 10;

  const [rewardsPage, setRewardsPage] = useState(1);
  const chains = useChains();
  const verifiersByChain = useVerifiersByChain();

  const { supportedChains } = { ...data };
  const { bonding_state, authorization_state, weight } = {
    ...Object.values({ ...verifiersByChain })
      .flatMap((d: unknown) => toArray((d as Record<string, unknown>)?.addresses))
      .find((d: unknown) => equalsIgnoreCase((d as Record<string, unknown>).address as string, address)),
  } as VerifierChainEntry;
  const { symbol } = { ...(getChainData('axelarnet', chains)?.native_token as Record<string, unknown>) } as { symbol?: string };

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Profile address={address} width={32} height={32} />
        </h3>
      </div>
      <div className={styles.infoPanelBorder}>
        <dl className={styles.infoPanelDefinitionList}>
          {supportedChains && (
            <>
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>
                  Status
                </dt>
                <dd className={styles.dlValueWithSpace}>
                  <Tag
                    className={clsx(
                      styles.statusTagFit,
                      supportedChains.length > 0
                        ? styles.statusTagActive
                        : styles.statusTagInactive
                    )}
                  >
                    {supportedChains.length > 0 ? 'Active' : 'Inactive'}
                  </Tag>
                  {isNumber(bonding_state?.Bonded?.amount) && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Bonding State:</span>
                      <Number
                        value={bonding_state.Bonded.amount}
                        suffix={` ${symbol}`}
                        noTooltip={true}
                      />
                    </div>
                  )}
                  {authorization_state && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>
                        Authorization State:
                      </span>
                      <span>{authorization_state}</span>
                    </div>
                  )}
                  {isNumber(weight) && (
                    <div className={styles.stateRow}>
                      <span className={styles.stateLabel}>Weight:</span>
                      <Number value={weight} noTooltip={true} />
                    </div>
                  )}
                </dd>
              </div>
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>
                  Amplifier Supported
                </dt>
                <dd className={styles.dlValue}>
                  <div className={styles.supportedChainsGrid}>
                    {supportedChains.map((c: string, i: number) => {
                      const { name, image } = { ...getChainData(c, chains) };

                      return (
                        <Tooltip
                          key={i}
                          content={name}
                          className={styles.chainTooltip}
                        >
                          <Image
                            src={image}
                            alt=""
                            width={20}
                            height={20}
                            className={styles.chainImage}
                          />
                        </Tooltip>
                      );
                    })}
                  </div>
                </dd>
              </div>
            </>
          )}
          {cumulativeRewards && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Cumulative Rewards
              </dt>
              <dd className={styles.dlValue}>
                <Tooltip
                  content={
                    <div className={styles.cumulativeRewardsTooltipContent}>
                      {(toArray(cumulativeRewards.chains) as RewardEntry[]).map((d: RewardEntry, i: number) => (
                        <Number
                          key={i}
                          value={d.amount}
                          format="0,0.000000"
                          prefix={`${getChainData(d.chain, chains)?.name || d.chain}: `}
                          noTooltip={true}
                          className={styles.cumulativeRewardsNumber}
                        />
                      ))}
                    </div>
                  }
                  className={styles.chainTooltip}
                  parentClassName={styles.cumulativeRewardsTooltipParent}
                >
                  <Number
                    value={cumulativeRewards.total_rewards}
                    suffix={` ${symbol}`}
                    noTooltip={true}
                    className={styles.cumulativeRewardsNumber}
                  />
                </Tooltip>
              </dd>
            </div>
          )}
          {rewards && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Latest Rewards Distribution
              </dt>
              <dd className={styles.dlValue}>
                <div className={styles.rewardsWrapper}>
                  <div className={styles.rewardsTableScroll}>
                    <table className={styles.rewardsTable}>
                      <thead className={styles.rewardsTableHead}>
                        <tr className={styles.rewardsTableHeadRow}>
                          <th
                            scope="col"
                            className={styles.rewardsThFirst}
                          >
                            Height
                          </th>
                          <th scope="col" className={styles.rewardsThMiddle}>
                            Chain
                          </th>
                          <th scope="col" className={styles.rewardsThRight}>
                            Payout
                          </th>
                          <th
                            scope="col"
                            className={styles.rewardsThLast}
                          >
                            Payout at
                          </th>
                        </tr>
                      </thead>
                      <tbody className={styles.rewardsTableBody}>
                        {rewards
                          .filter(
                            (_d: RewardEntry, i: number) =>
                              i >= (rewardsPage - 1) * rewardsSizePerPage &&
                              i < rewardsPage * rewardsSizePerPage
                          )
                          .map((d: RewardEntry, i: number) => {
                            const { name, image } = {
                              ...getChainData(d.chain, chains),
                            };

                            return (
                              <tr
                                key={i}
                                className={styles.rewardsRow}
                              >
                                <td className={styles.rewardsTdFirst}>
                                  <div className={styles.rewardsTdFirstInner}>
                                    <Copy size={16} value={d.height}>
                                      <Link
                                        href={`/block/${d.height}`}
                                        target="_blank"
                                        className={styles.blueLink}
                                      >
                                        <Number
                                          value={d.height}
                                          className={styles.numberXs}
                                        />
                                      </Link>
                                    </Copy>
                                  </div>
                                </td>
                                <td className={styles.rewardsTdMiddle}>
                                  <div className={styles.rewardsTdMiddleInner}>
                                    {name ? (
                                      <Tooltip
                                        content={name}
                                        className={styles.chainTooltip}
                                      >
                                        <Image
                                          src={image}
                                          alt=""
                                          width={20}
                                          height={20}
                                        />
                                      </Tooltip>
                                    ) : (
                                      <span className={styles.chainFallbackText}>
                                        {d.chain}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className={styles.rewardsTdRight}>
                                  <div className={styles.rewardsTdRightInner}>
                                    <Number
                                      value={d.amount}
                                      className={styles.amountValue}
                                    />
                                  </div>
                                </td>
                                <td className={styles.rewardsTdLast}>
                                  <div className={styles.rewardsTdLastInner}>
                                    <TimeAgo timestamp={d.created_at?.ms} />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {rewards.length > rewardsSizePerPage && (
                    <TablePagination
                      data={rewards}
                      value={rewardsPage}
                      onChange={(page: number) => setRewardsPage(page)}
                      sizePerPage={rewardsSizePerPage}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

interface VotesProps {
  data: VerifierPollEntry[] | null;
}

function Votes({ data }: VotesProps) {
  const chains = useChains();

  const totalY = (toArray(data) as VerifierPollEntry[]).filter(
    (d: VerifierPollEntry) => typeof d.vote === 'boolean' && d.vote
  ).length;
  const totalN = (toArray(data) as VerifierPollEntry[]).filter(
    (d: VerifierPollEntry) => typeof d.vote === 'boolean' && !d.vote
  ).length;
  const totalUN = (toArray(data) as VerifierPollEntry[]).filter((d: VerifierPollEntry) => typeof d.vote !== 'boolean').length;
  const totalVotes = Object.fromEntries(
    Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(
      ([_k, v]) => v || _k === 'Y'
    )
  );

  if (!data || data.length === 0) return null;

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>
            Amplifier Votes
          </h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(size, '0,0')} Polls
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={
              (data.filter((d: VerifierPollEntry) => typeof d.vote === 'boolean').length * 100) /
              data.length
            }
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={`${Object.keys(totalVotes).length > 1 ? '(' : ''}${Object.entries(
              totalVotes
            )
              .map(([k, v]) => `${numberFormat(v, '0,0')}${k}`)
              .join(' : ')}${Object.keys(totalVotes).length > 1 ? ')' : ''}/`}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d: VerifierPollEntry, i: number) => {
          const { name } = { ...getChainData(d.sender_chain, chains) };

          return (
            <Link
              key={i}
              href={d.id ? `/amplifier-poll/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className={styles.blockLink}
            >
              <Tooltip
                content={
                  d.poll_id
                    ? `Poll ID: ${d.poll_id} (${name})`
                    : numberFormat(d.height, '0,0')
                }
                className={styles.chainTooltip}
              >
                <div
                  className={clsx(
                    styles.blockDot,
                    typeof d.vote === 'boolean'
                      ? d.vote
                        ? styles.blockDotActive
                        : styles.blockDotNo
                      : styles.blockDotInactive
                  )}
                />
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface SignsProps {
  data: VerifierSignEntry[] | null;
}

function Signs({ data }: SignsProps) {
  const chains = useChains();

  const totalSigned = (toArray(data) as VerifierSignEntry[]).filter(
    (d: VerifierSignEntry) => typeof d.sign === 'boolean' && d.sign
  ).length;
  const totalUN = (toArray(data) as VerifierSignEntry[]).filter((d: VerifierSignEntry) => typeof d.sign !== 'boolean').length;
  const totalSigns = Object.fromEntries(
    Object.entries({ S: totalSigned, UN: totalUN }).filter(
      ([_k, v]) => v || _k === 'S'
    )
  );

  if (!data || data.length === 0) return null;

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>
            Amplifier Signings
          </h3>
          <p className={styles.sectionSubtitle}>
            Latest {numberFormat(size, '0,0')} Signings
          </p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number
            value={
              (data.filter((d: VerifierSignEntry) => typeof d.sign === 'boolean').length * 100) /
              data.length
            }
            suffix="%"
            className={styles.sectionTitle}
          />
          <Number
            value={data.length}
            format="0,0"
            prefix={`${Object.keys(totalSigns).length > 1 ? '(' : ''}${Object.entries(
              totalSigns
            )
              .map(
                ([k, v]) => `${numberFormat(v, '0,0')}${k === 'S' ? '' : k}`
              )
              .join(' : ')}${Object.keys(totalSigns).length > 1 ? ')' : ''}/`}
            className={styles.sectionSubtitle}
          />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d: VerifierSignEntry, i: number) => {
          const { name } = {
            ...getChainData(d.chain || d.destination_chain, chains),
          };

          return (
            <Link
              key={i}
              href={d.id ? `/amplifier-proof/${d.id}` : `/block/${d.height}`}
              target="_blank"
              className={styles.blockLink}
            >
              <Tooltip
                content={
                  d.session_id
                    ? `Session ID: ${d.session_id} (${name})`
                    : numberFormat(d.height, '0,0')
                }
                className={styles.chainTooltip}
              >
                <div
                  className={clsx(
                    styles.blockDot,
                    typeof d.sign === 'boolean'
                      ? d.sign
                        ? styles.blockDotActive
                        : styles.blockDotNo
                      : styles.blockDotInactive
                  )}
                />
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const size = 200;

interface VerifierProps {
  address: string;
}

export function Verifier({ address }: VerifierProps) {
  const [data, setData] = useState<VerifierData | null>(null);
  const [votes, setVotes] = useState<VerifierPollEntry[] | null>(null);
  const [signs, setSigns] = useState<VerifierSignEntry[] | null>(null);
  const [rewards, setRewards] = useState<RewardEntry[] | null>(null);
  const [cumulativeRewards, setCumulativeRewards] = useState<CumulativeRewardsData | null>(null);
  const _chains = useChains();
  const verifiers = useVerifiers();

  // set verifier data
  useEffect(() => {
    const getData = async () => {
      if (address && verifiers) {
        const _data = verifiers.find((d: unknown) => equalsIgnoreCase((d as Record<string, unknown>).address as string, address));

        if (_data) {
          if (!_.isEqual(_data, data)) {
            setData(_data as VerifierData);
          }
        } else if (!data) {
          setData({
            status: 'errorOnGetData',
            code: 404,
            message: `Verifier: ${address} not found`,
          });
        }
      }
    };

    getData();
  }, [address, data, setData, verifiers]);

  // set verifier metrics
  useEffect(() => {
    const getData = async () => {
      if (address && data && data.status !== 'error') {
        const verifierAddress = data.address;
        const { latest_block_height } = { ...(await getRPCStatus() as Record<string, unknown>) } as { latest_block_height?: number };

        if (latest_block_height) {
          await Promise.all(
            ['votes', 'signs', 'rewards', 'cumulative_rewards'].map(
              (d) =>
                new Promise<void>(async (resolve) => {
                  switch (d) {
                    case 'votes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = 1;

                        const { data } = {
                          ...((verifierAddress
                            ? await searchAmplifierPolls({
                              voter: verifierAddress,
                              fromBlock,
                              toBlock,
                              size,
                            })
                            : undefined) as Record<string, unknown> | undefined),
                        };

                        setVotes(
                          toArray(data).map((d: unknown) =>
                            Object.fromEntries(
                              Object.entries(d as Record<string, unknown>)
                                // filter verifier address
                                .filter(
                                  ([k, _v]) =>
                                    !k.startsWith('axelar') ||
                                    equalsIgnoreCase(k, verifierAddress)
                                )
                                // flatMap vote data
                                .flatMap(([k, v]) =>
                                  equalsIgnoreCase(k, verifierAddress)
                                    ? Object.entries({ ...(v as Record<string, unknown>) }).map(([k, v]) => [
                                        k === 'id' ? 'txhash' : k,
                                        v,
                                      ])
                                    : [[k, v]]
                                )
                            )
                          ) as VerifierPollEntry[]
                        );
                      } catch (_error) {}
                      break;
                    case 'signs':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = 1;

                        const { data } = {
                          ...((verifierAddress
                            ? await searchAmplifierProofs({
                              signer: verifierAddress,
                              fromBlock,
                              toBlock,
                              size,
                            })
                            : undefined) as Record<string, unknown> | undefined),
                        };

                        setSigns(
                          toArray(data).map((d: unknown) =>
                            Object.fromEntries(
                              Object.entries(d as Record<string, unknown>)
                                // filter verifier address
                                .filter(
                                  ([k, _v]) =>
                                    !k.startsWith('axelar') ||
                                    equalsIgnoreCase(k, verifierAddress)
                                )
                                // flatMap sign data
                                .flatMap(([k, v]) =>
                                  equalsIgnoreCase(k, verifierAddress)
                                    ? Object.entries({ ...(v as Record<string, unknown>) }).map(([k, v]) => [
                                        k === 'id' ? 'txhash' : k,
                                        v,
                                      ])
                                    : [[k, v]]
                                )
                            )
                          ) as VerifierSignEntry[]
                        );
                      } catch (_error) {}
                      break;
                    case 'rewards':
                      try {
                        const { data } = {
                          ...((verifierAddress
                            ? await searchVerifiersRewards({
                              verifierAddress,
                              fromBlock: 1,
                              size,
                            })
                            : undefined) as Record<string, unknown> | undefined),
                        };
                        setRewards(toArray(data));
                      } catch (_error) {}
                      break;
                    case 'cumulative_rewards':
                      try {
                        const { data } = {
                          ...((verifierAddress
                            ? await getVerifiersRewards({
                              verifierAddress,
                              fromBlock: 1,
                            })
                            : undefined) as Record<string, unknown> | undefined),
                        };
                        setCumulativeRewards((data as CumulativeRewardsData[] | undefined)?.[0] ?? null);
                      } catch (_error) {}
                      break;
                    default:
                      break;
                  }

                  resolve();
                })
            )
          );
        }
      }
    };

    getData();
  }, [address, data]);

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className={styles.mainGrid}>
          <div className={styles.mainLeft}>
            <Info
              data={data}
              address={address}
              rewards={rewards}
              cumulativeRewards={cumulativeRewards}
            />
          </div>
          {!(votes || signs) ? (
            <Spinner />
          ) : (
            <div className={styles.mainRight}>
              <Votes data={votes} />
              <Signs data={signs} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

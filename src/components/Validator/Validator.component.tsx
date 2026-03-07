'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// @ts-expect-error react-linkify has no type declarations
import Linkify from 'react-linkify';
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
import { TablePagination } from '@/components/Pagination';
import { useValidatorStore } from '@/components/Validators';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { getBalances } from '@/lib/api/axelarscan';
import {
  getRPCStatus,
  searchUptimes,
  searchProposedBlocks,
  searchEVMPolls,
  getChainMaintainers,
  getValidatorDelegations,
} from '@/lib/api/validator';
import { ENVIRONMENT, getChainData, getAssetData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  find,
  includesSomePatterns,
  ellipse,
} from '@/lib/string';
import { isNumber, numberFormat } from '@/lib/number';
import type { Chain, Validator as ValidatorType, Delegation, UptimeBlock, ProposedBlock, EVMVote } from '@/types';
import * as styles from './Validator.styles';

interface InfoProps {
  data: ValidatorType;
  address: string;
  delegations: Delegation[] | null;
}

function Info({ data, address, delegations }: InfoProps) {
  const delegationsSizePerPage = 10;

  const [delegationsPage, setDelegationsPage] = useState(1);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  const {
    operator_address,
    consensus_address,
    delegator_address,
    broadcaster_address,
    broadcasterBalance,
    status,
    tokens,
    quadratic_voting_power,
    supportedChains,
  } = { ...data };
  const { details, website } = { ...data?.description };
  const { rate } = { ...data?.commission?.commission_rates };

  const totalVotingPower = _.sumBy(
    toArray(validators).filter((d: ValidatorType) => d.status === 'BOND_STATUS_BONDED'),
    'tokens'
  );
  const totalQuadraticVotingPower = _.sumBy(
    toArray(validators).filter((d: ValidatorType) => d.status === 'BOND_STATUS_BONDED'),
    'quadratic_voting_power'
  );

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoPanelHeader}>
        <h3 className={styles.infoPanelTitle}>
          <Profile address={address} width={32} height={32} />
        </h3>
        <div className={styles.infoPanelDescriptionWrapper}>
          {details && (
            <div className={styles.infoPanelDetails}>
              <Linkify>{details}</Linkify>
            </div>
          )}
          {website && (
            <Link
              href={website}
              target="_blank"
              className={styles.infoPanelWebsite}
            >
              {website}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.infoPanelBorder}>
        <dl className={styles.infoPanelDefinitionList}>
          {operator_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Operator Address
              </dt>
              <dd className={styles.dlValue}>
                <Copy value={operator_address}>
                  <span>{ellipse(operator_address, 10, 'axelarvaloper')}</span>
                </Copy>
              </dd>
            </div>
          )}
          {consensus_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Consensus Address
              </dt>
              <dd className={styles.dlValue}>
                <Copy value={consensus_address}>
                  <span>{ellipse(consensus_address, 10, 'axelarvalcons')}</span>
                </Copy>
              </dd>
            </div>
          )}
          {delegator_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Delegator Address
              </dt>
              <dd className={styles.dlValue}>
                <Copy value={delegator_address}>
                  <Link
                    href={`/account/${delegator_address}`}
                    target="_blank"
                    className={styles.blueLink}
                  >
                    {ellipse(delegator_address, 14, 'axelar')}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          {broadcaster_address && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Broadcaster Address
              </dt>
              <dd className={styles.dlValue}>
                <div className={styles.broadcasterWrapper}>
                  <Copy value={broadcaster_address}>
                    <Link
                      href={`/account/${broadcaster_address}`}
                      target="_blank"
                      className={styles.blueLink}
                    >
                      {ellipse(broadcaster_address, 14, 'axelar')}
                    </Link>
                  </Copy>
                  {isNumber(broadcasterBalance?.amount) && (
                    <Number
                      value={broadcasterBalance.amount}
                      suffix={` ${broadcasterBalance.symbol}`}
                      className={clsx(
                        'font-medium',
                        broadcasterBalance.amount < 5
                          ? styles.balanceLow
                          : styles.balanceOk
                      )}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dlLabel}>
              Status
            </dt>
            <dd className={styles.dlValue}>
              {status && (
                <Tag
                  className={clsx(
                    'w-fit',
                    status.includes('UN')
                      ? status.endsWith('ED')
                        ? styles.statusUnbonded
                        : styles.statusUnbonding
                      : styles.statusBonded
                  )}
                >
                  {status.replace('BOND_STATUS_', '')}
                </Tag>
              )}
            </dd>
          </div>
          {isNumber(rate) && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                Commission
              </dt>
              <dd className={styles.dlValue}>
                <Number
                  value={(rate as number) * 100}
                  maxDecimals={2}
                  suffix="%"
                  noTooltip={true}
                  className="font-medium"
                />
              </dd>
            </div>
          )}
          {isNumber(tokens) && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                {status === 'BOND_STATUS_BONDED'
                  ? 'Consensus Power'
                  : 'Staking'}
              </dt>
              <dd className={styles.dlValue}>
                <div className={styles.votingPowerRow}>
                  <Number
                    value={tokens}
                    format="0,0.0a"
                    noTooltip={true}
                    className={styles.votingPowerValue}
                  />
                  {status === 'BOND_STATUS_BONDED' && (
                    <Number
                      value={((tokens as number) * 100) / totalVotingPower}
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className={styles.votingPowerPercent}
                    />
                  )}
                </div>
              </dd>
            </div>
          )}
          {isNumber(quadratic_voting_power) &&
            status === 'BOND_STATUS_BONDED' && (
              <div className={styles.dlRow}>
                <dt className={styles.dlLabel}>
                  Quadratic Power
                </dt>
                <dd className={styles.dlValue}>
                  <div className={styles.votingPowerRow}>
                    <Number
                      value={quadratic_voting_power}
                      format="0,0.0a"
                      noTooltip={true}
                      className={styles.votingPowerValue}
                    />
                    <Number
                      value={
                        ((quadratic_voting_power as number) * 100) /
                        totalQuadraticVotingPower
                      }
                      format="0,0.0a"
                      prefix="("
                      suffix="%)"
                      noTooltip={true}
                      className={styles.votingPowerPercent}
                    />
                  </div>
                </dd>
              </div>
            )}
          {supportedChains && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>
                EVM Supported
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
          )}
          {delegations && (
            <div className={styles.dlRow}>
              <dt className={styles.dlLabel}>{`Delegation${delegations.length > 1 ? `s (${numberFormat(delegations.length, '0,0')})` : ''}`}</dt>
              <dd className={styles.dlValue}>
                <div className={styles.delegationsWrapper}>
                  <div className={styles.delegationsTableScroll}>
                    <table className={styles.delegationsTable}>
                      <thead className={styles.delegationsTableHead}>
                        <tr className={styles.delegationsTableHeadRow}>
                          <th
                            scope="col"
                            className={styles.delegationsThFirst}
                          >
                            Delegator
                          </th>
                          <th scope="col" className={styles.delegationsThMiddle}>
                            Amount
                          </th>
                          <th
                            scope="col"
                            className={styles.delegationsThLast}
                          >
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className={styles.delegationsTableBody}>
                        {delegations
                          .filter(
                            (_d: Delegation, i: number) =>
                              i >=
                                (delegationsPage - 1) *
                                  delegationsSizePerPage &&
                              i < delegationsPage * delegationsSizePerPage
                          )
                          .map((d: Delegation, i: number) => {
                            const { price } = {
                              ...getAssetData(d.denom, assets),
                            } as Record<string, unknown>;

                            return (
                              <tr
                                key={i}
                                className={styles.delegationsRow}
                              >
                                <td className={styles.delegationsTdFirst}>
                                  <Copy size={14} value={d.delegator_address}>
                                    <Link
                                      href={`/account/${d.delegator_address}`}
                                      target="_blank"
                                      className={styles.delegatorLink}
                                    >
                                      {ellipse(
                                        d.delegator_address,
                                        6,
                                        'axelar'
                                      )}
                                    </Link>
                                  </Copy>
                                </td>
                                <td className={styles.delegationsTdMiddle}>
                                  <div className={styles.delegationsAmountWrapper}>
                                    <Number
                                      value={d.amount}
                                      className={styles.delegationsAmountValue}
                                    />
                                  </div>
                                </td>
                                <td className={styles.delegationsTdLast}>
                                  {isNumber(d.amount) && isNumber(price) && (
                                    <div className={styles.delegationsAmountWrapper}>
                                      <Number
                                        value={d.amount * (price as number)}
                                        prefix="$"
                                        noTooltip={true}
                                        className={styles.delegationsValueNumber}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {delegations.length > delegationsSizePerPage && (
                    <TablePagination
                      data={delegations}
                      value={delegationsPage}
                      onChange={(page: number) => setDelegationsPage(page)}
                      sizePerPage={delegationsSizePerPage}
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

interface UptimesProps {
  data: UptimeBlock[] | null;
}

function Uptimes({ data }: UptimesProps) {
  return (
    data && (
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <h3 className={styles.sectionTitle}>
              Uptimes
            </h3>
            <p className={styles.sectionSubtitle}>
              Latest {numberFormat(size, '0,0')} Blocks
            </p>
          </div>
          <div className={styles.sectionHeaderRight}>
            <Number
              value={(data.filter((d: UptimeBlock) => d.status).length * 100) / data.length}
              suffix="%"
              className={styles.sectionTitle}
            />
            <Number
              value={data.filter((d: UptimeBlock) => d.status).length}
              format="0,0"
              suffix={`/${data.length}`}
              className={styles.sectionSubtitle}
            />
          </div>
        </div>
        <div className={styles.blockGrid}>
          {data.map((d: UptimeBlock, i: number) => (
            <Link
              key={i}
              href={`/block/${d.height}`}
              target="_blank"
              className={styles.blockLink}
            >
              <Tooltip content={numberFormat(d.height, '0,0')}>
                <div
                  className={clsx(
                    styles.blockDot,
                    d.status
                      ? styles.blockDotActive
                      : styles.blockDotInactive
                  )}
                />
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}

interface ProposedBlocksProps {
  data: ProposedBlock[] | null;
}

function ProposedBlocks({ data }: ProposedBlocksProps) {
  return (
    data && (
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <h3 className={styles.sectionTitle}>
              Proposed Blocks
            </h3>
            <p className={styles.sectionSubtitle}>
              Latest {numberFormat(NUM_LATEST_PROPOSED_BLOCKS, '0,0')} Blocks
            </p>
          </div>
          <div className={styles.sectionHeaderRight}>
            <Number
              value={(data.length * 100) / NUM_LATEST_PROPOSED_BLOCKS}
              suffix="%"
              className={styles.sectionTitle}
            />
            <Number
              value={data.length}
              format="0,0"
              suffix={`/${NUM_LATEST_PROPOSED_BLOCKS}`}
              className={styles.sectionSubtitle}
            />
          </div>
        </div>
        <div className={styles.blockGrid}>
          {data.map((d: ProposedBlock, i: number) => (
            <Link
              key={i}
              href={`/block/${d.height}`}
              target="_blank"
              className={styles.blockLink}
            >
              <Tooltip content={numberFormat(d.height, '0,0')}>
                <div
                  className={clsx(
                    styles.blockDot,
                    styles.blockDotActive
                  )}
                />
              </Tooltip>
            </Link>
          ))}
        </div>
      </div>
    )
  );
}

interface VotesProps {
  data: EVMVote[] | null;
}

function Votes({ data }: VotesProps) {
  const chains = useChains();

  const totalY = toArray(data).filter(
    (d: EVMVote) => typeof d.vote === 'boolean' && d.vote
  ).length;
  const totalN = toArray(data).filter(
    (d: EVMVote) => typeof d.vote === 'boolean' && !d.vote
  ).length;
  const totalUN = toArray(data).filter((d: EVMVote) => typeof d.vote !== 'boolean').length;
  const totalVotes = Object.fromEntries(
    Object.entries({ Y: totalY, N: totalN, UN: totalUN }).filter(
      ([_k, v]) => v || _k === 'Y'
    )
  );

  return (
    data && data.length > 0 && (
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeaderVotes}>
          <div className={styles.sectionHeaderLeft}>
            <h3 className={styles.sectionTitle}>
              EVM Votes
            </h3>
            <p className={styles.sectionSubtitle}>
              Latest {numberFormat(size, '0,0')} Polls (
              {numberFormat(NUM_LATEST_BLOCKS, '0,0')} Blocks)
            </p>
          </div>
          <div className={styles.sectionHeaderRight}>
            <Number
              value={
                (data.filter((d: EVMVote) => typeof d.vote === 'boolean').length * 100) /
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
          {data.map((d: EVMVote, i: number) => {
            const { name } = { ...getChainData(d.sender_chain, chains) };

            return (
              <Link
                key={i}
                href={d.id ? `/evm-poll/${d.id}` : `/block/${d.height}`}
                target="_blank"
                className={styles.blockLink}
              >
                <Tooltip
                  content={
                    d.id
                      ? `Poll ID: ${d.id} (${name})`
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
    )
  );
}

const size = 200;
const NUM_LATEST_BLOCKS = 10000;
const NUM_LATEST_PROPOSED_BLOCKS = 2500;

interface ValidatorProps {
  address: string;
}

export function Validator({ address }: ValidatorProps) {
  const router = useRouter();
  const [EVMChains, setEVMChains] = useState<Chain[] | null>(null);
  const [data, setData] = useState<ValidatorType | null>(null);
  const [delegations, setDelegations] = useState<Delegation[] | null>(null);
  const [uptimes, setUptimes] = useState<UptimeBlock[] | null>(null);
  const [proposedBlocks, setProposedBlocks] = useState<ProposedBlock[] | null>(null);
  const [votes, setVotes] = useState<EVMVote[] | null>(null);
  const chains = useChains();
  const validators = useValidators();
  const { maintainers, setMaintainers } = useValidatorStore();

  // redirect or get evm chains
  useEffect(() => {
    if (address && validators) {
      if (
        ['axelarvalcons', 'axelar1'].findIndex(p => address.startsWith(p)) > -1
      ) {
        const { operator_address } = {
          ...validators.find((d: ValidatorType) =>
            includesSomePatterns(
              [d.consensus_address, d.delegator_address, d.broadcaster_address].filter((s): s is string => !!s),
              address
            )
          ),
        };

        if (operator_address) {
          router.push(`/validator/${operator_address}`);
        }
      } else if (address.startsWith('axelarvaloper') && chains) {
        setEVMChains(
          chains.filter((d: Chain) => d.chain_type === 'evm' && d.gateway?.address)
        );
      }
    }
  }, [address, router, setEVMChains, chains, validators]);

  // getChainMaintainers
  useEffect(() => {
    const getData = async () => {
      if (EVMChains) {
        setMaintainers(
          Object.fromEntries(
            await Promise.all(
              EVMChains.filter((d: Chain) => !maintainers?.[d.id]).map(
                (d: Chain) =>
                  new Promise<[string, string[]]>(async resolve => {
                    const { maintainers } = {
                      ...(await getChainMaintainers({ chain: d.id }) as Record<string, unknown>),
                    };
                    resolve([d.id, toArray(maintainers) as string[]]);
                  })
              )
            )
          )
        );
      }
    };

    getData();
  }, [EVMChains, setMaintainers]);

  // set validator data
  useEffect(() => {
    const getData = async () => {
      if (
        address?.startsWith('axelarvaloper') &&
        EVMChains &&
        validators &&
        Object.keys({ ...maintainers }).length === EVMChains.length
      ) {
        const _data = validators.find((d: ValidatorType) =>
          equalsIgnoreCase(d.operator_address, address)
        );

        if (_data) {
          // broadcaster balance
          if (_data.broadcaster_address) {
            const { data: balanceData } = {
              ...(await getBalances({ address: _data.broadcaster_address }) as Record<string, unknown>),
            };
            _data.broadcasterBalance = toArray(balanceData).find(
              (d: Record<string, unknown>) =>
                d.denom ===
                (ENVIRONMENT === 'devnet-amplifier' ? 'uamplifier' : 'uaxl')
            ) as ValidatorType['broadcasterBalance'];
          }

          // support chains
          _data.supportedChains = Object.entries({ ...maintainers })
            .filter(([_k, v]) => find(_data.operator_address, v as string[]))
            .map(([k, _v]) => k);

          if (!_.isEqual(_data, data)) {
            setData(_data);
          }
        } else if (!data) {
          setData({
            operator_address: '',
            status: 'errorOnGetData',
            code: 404,
            message: `Validator: ${address} not found`,
          });
        }
      }
    };

    getData();
  }, [address, EVMChains, data, setData, validators, maintainers]);

  // set validator metrics
  useEffect(() => {
    const getData = async () => {
      if (address && data && data.status !== 'error') {
        const { consensus_address, broadcaster_address } = { ...data };
        const { latest_block_height } = { ...(await getRPCStatus() as Record<string, unknown>) } as { latest_block_height?: number };

        if (latest_block_height) {
          await Promise.all(
            ['delegations', 'uptimes', 'proposedBlocks', 'votes'].map(
              (d: string) =>
                new Promise<void>(async resolve => {
                  switch (d) {
                    case 'delegations':
                      setDelegations(
                        (await getValidatorDelegations({ address }) as Record<string, unknown>)?.data as Delegation[] | null
                      );
                      break;
                    case 'uptimes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - size;

                        const { data: uptimeData } = {
                          ...(await searchUptimes({
                            fromBlock,
                            toBlock,
                            size,
                          }) as Record<string, unknown>),
                        };

                        setUptimes(
                          _.range(0, size).map(i => {
                            const height = toBlock - i;
                            const ud = toArray(uptimeData).find(
                              (item: Record<string, unknown>) => item.height === height
                            ) as Record<string, unknown> | undefined;

                            return {
                              ...ud,
                              height,
                              status:
                                toArray(ud?.validators as string[]).findIndex((a: string) =>
                                  equalsIgnoreCase(a, consensus_address as string)
                                ) > -1,
                            };
                          })
                        );
                      } catch (_error) {}
                      break;
                    case 'proposedBlocks':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_PROPOSED_BLOCKS;

                        const { data: proposedData } = {
                          ...(await searchProposedBlocks({
                            fromBlock,
                            toBlock,
                            size: NUM_LATEST_PROPOSED_BLOCKS,
                          }) as Record<string, unknown>),
                        };

                        setProposedBlocks(
                          toArray(proposedData).filter((d: Record<string, unknown>) =>
                            equalsIgnoreCase(d.proposer as string, consensus_address as string)
                          ) as ProposedBlock[]
                        );
                      } catch (_error) {}
                      break;
                    case 'votes':
                      try {
                        const toBlock = latest_block_height - 1;
                        const fromBlock = toBlock - NUM_LATEST_BLOCKS;

                        const { data: votesData } = {
                          ...((broadcaster_address &&
                            (await searchEVMPolls({
                              voter: broadcaster_address as string,
                              fromBlock,
                              toBlock,
                              size,
                            }))) as Record<string, unknown>),
                        };

                        setVotes(
                        toArray(votesData).map((d: unknown) =>
                            Object.fromEntries(
                              Object.entries(d as Record<string, unknown>)
                                // filter broadcaster address
                                .filter(
                                  ([k, _v]) =>
                                    !k.startsWith('axelar1') ||
                                    equalsIgnoreCase(k, broadcaster_address as string)
                                )
                                // flatMap vote data
                                .flatMap(([k, v]) =>
                                  equalsIgnoreCase(k, broadcaster_address as string)
                                    ? Object.entries({ ...(v as Record<string, unknown>) }).map(([k2, v2]) => [
                                        k2 === 'id' ? 'txhash' : k2,
                                        v2,
                                      ])
                                    : [[k, v]]
                                )
                            )
                          ) as EVMVote[]
                        );
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
        <Response data={{ code: data.code as number | string, message: data.message as string }} />
      ) : (
        <div className={styles.mainGrid}>
          <div className={styles.mainLeft}>
            <Info data={data} address={address} delegations={delegations} />
          </div>
          {!(uptimes || proposedBlocks || votes) ? (
            <Spinner />
          ) : (
            <div className={styles.mainRight}>
              <Uptimes data={uptimes} />
              <ProposedBlocks data={proposedBlocks} />
              <Votes data={votes} />
            </div>
          )}
        </div>
      )}
    </Container>
  );
}

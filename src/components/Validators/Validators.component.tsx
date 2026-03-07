'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import clsx from 'clsx';
import _ from 'lodash';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { Container } from '@/components/Container';
import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { ProgressBar } from '@/components/ProgressBar';
import { Spinner } from '@/components/Spinner';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { useChains, useValidators, useInflationData, useNetworkParameters } from '@/hooks/useGlobalData';
import { getValidatorsVotes, getChainMaintainers } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find, ellipse } from '@/lib/string';
import {
  isNumber,
  toNumber,
  formatUnits,
  toFixed,
  numberFormat,
} from '@/lib/number';
import type { Chain, Validator as ValidatorType } from '@/types';
import * as styles from './Validators.styles';

interface ValidatorStoreState {
  maintainers: Record<string, string[]> | null;
  setMaintainers: (data: Record<string, string[]>) => void;
}

export const useValidatorStore = create<ValidatorStoreState>()(set => ({
  maintainers: null,
  setMaintainers: (data: Record<string, string[]>) =>
    set(state => ({
      ...state,
      maintainers: { ...state.maintainers, ...data },
    })),
}));

const STATUSES = ['active', 'inactive'];

interface ValidatorsProps {
  status?: string;
}

export function Validators({ status }: ValidatorsProps) {
  const [EVMChains, setEVMChains] = useState<Chain[] | null>(null);
  const [validatorsVotes, setValidatorsVotes] = useState<Record<string, unknown> | null>(null);
  const [data, setData] = useState<ValidatorType[] | null>(null);
  const [order, setOrder] = useState<[string, string]>(['tokens', 'desc']);
  const chains = useChains();
  const validators = useValidators();
  const inflationData = useInflationData();
  const networkParameters = useNetworkParameters();
  const { maintainers, setMaintainers } = useValidatorStore();

  // get evm chains
  useEffect(() => {
    if (chains) {
      setEVMChains(
        chains.filter(
          (d: Chain) => d.chain_type === 'evm' && d.gateway?.address && !d.no_inflation
        )
      );
    }
  }, [setEVMChains, chains]);

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
                    const response = await getChainMaintainers({ chain: d.id });
                    const { maintainers } = { ...(response as Record<string, unknown>) };
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

  // getValidatorsVotes
  useEffect(() => {
    const getData = async () => {
      const response = await getValidatorsVotes();

      if ((response as Record<string, unknown>)?.data) {
        setValidatorsVotes(response as Record<string, unknown>);
      }
    };

    getData();
  }, [setValidatorsVotes]);

  // set validators data
  useEffect(() => {
    if (
      EVMChains &&
      validatorsVotes &&
      validators &&
      inflationData &&
      networkParameters &&
      Object.keys({ ...maintainers }).length === EVMChains.length
    ) {
      const {
        tendermintInflationRate,
        keyMgmtRelativeInflationRate,
        externalChainVotingInflationRate,
        communityTax,
      } = { ...inflationData } as Record<string, unknown>;
      const { bankSupply, stakingPool } = { ...networkParameters } as Record<string, Record<string, unknown> | undefined>;

      const _data = _.orderBy(
        (validators as ValidatorType[]).map((d: ValidatorType) => {
          const { rate } = { ...d.commission?.commission_rates };

          const vv = validatorsVotes as Record<string, unknown>;
          if (vv.data) {
            d.total_polls = toNumber(vv.total);
            const vvData = vv.data as Record<string, Record<string, unknown>>;
            d.votes = { ...vvData[d.broadcaster_address as string] };
            const dVotes = d.votes as Record<string, unknown>;
            d.total_votes = toNumber(dVotes.total);

            const getVoteCount = (vote: boolean | string, votes: Record<string, unknown>) =>
              _.sum(
                Object.values({ ...votes }).map((v: unknown) =>
                  toNumber(
                    _.last(
                      Object.entries({ ...((v as Record<string, unknown>)?.votes as Record<string, unknown>) }).find(([k, _v]) =>
                        equalsIgnoreCase(k, vote?.toString())
                      )
                    )
                  )
                )
              );

            d.total_yes_votes = getVoteCount(true, dVotes.chains as Record<string, unknown>);
            d.total_no_votes = getVoteCount(false, dVotes.chains as Record<string, unknown>);
            d.total_unsubmitted_votes = getVoteCount(
              'unsubmitted',
              dVotes.chains as Record<string, unknown>
            );
          }

          const supportedChains = Object.entries({ ...maintainers })
            .filter(([_k, v]) => find(d.operator_address as string, v))
            .map(([k, _v]) => k);

          const inflation = toFixed(
            ((d.uptime as number) / 100) * toNumber(tendermintInflationRate) +
              (isNumber(d.heartbeats_uptime) ? (d.heartbeats_uptime as number) / 100 : 1) *
                toNumber(keyMgmtRelativeInflationRate) *
                toNumber(tendermintInflationRate) +
              toNumber(externalChainVotingInflationRate) *
                _.sum(
                  supportedChains.map((c: string) => {
                    const { total, total_polls } = { ...((d.votes as Record<string, unknown>)?.chains as Record<string, Record<string, unknown>> | undefined)?.[c] } as Record<string, unknown>;
                    return (
                      1 -
                      (total_polls ? ((total_polls as number) - (total as number)) / (total_polls as number) : 0)
                    );
                  })
                ),
            6
          );

          return {
            ...d,
            inflation,
            apr:
              ((inflation as unknown as number) *
                100 *
                (formatUnits(bankSupply?.amount as string, 6) as number) *
                (1 - toNumber(communityTax)) *
                (1 - toNumber(rate))) /
              (formatUnits(stakingPool?.bonded_tokens as string, 6) as number),
            supportedChains,
            votes: d.votes && {
              ...(d.votes as Record<string, unknown>),
              chains: Object.fromEntries(
                Object.entries({ ...((d.votes as Record<string, unknown>).chains as Record<string, unknown>) }).filter(([k, _v]) =>
                  find(k, supportedChains)
                )
              ),
            },
          };
        }),
        toArray([order[0], order[0] === 'quadratic_voting_power' && 'tokens']) as string[],
        [order[1], order[1]] as ('asc' | 'desc')[]
      );

      if (!_.isEqual(_data, data)) {
        setData(_data);
      }
    }
  }, [
    status,
    EVMChains,
    validatorsVotes,
    data,
    setData,
    order,
    validators,
    inflationData,
    networkParameters,
    maintainers,
  ]);

  const orderBy = (key: string) => {
    switch (key) {
      case 'quadratic_voting_power':
        key = status === 'active' ? key : 'tokens';
      // falls through
      default:
        setOrder([
          key || 'tokens',
          key !== order[0] || order[1] === 'asc' ? 'desc' : 'asc',
        ]);
        break;
    }
  };

  const filter = (filterStatus?: string) =>
    toArray(data).filter((d: ValidatorType) =>
      filterStatus === 'inactive'
        ? d.status !== 'BOND_STATUS_BONDED'
        : d.status === 'BOND_STATUS_BONDED' && !d.jailed
    );

  return (
    <Container className={styles.container}>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>
                  Validators
                </h1>
                <span className={styles.titleSeparator}>|</span>
                <Link
                  href="/verifiers"
                  className={styles.verifiersLink}
                >
                  Verifiers
                </Link>
              </div>
              <p className={styles.subtitle}>
                List of {status || 'active'} validators in Axelar Network with
                the latest 10K blocks performance.
                {(!status || status === 'active') && (
                  <>
                    &nbsp;
                    <Link
                      href="https://www.axelar.network/blog/how-to-stake-the-axl-token-on-the-axelar-network"
                      target="_blank"
                      aria-label="How to stake AXL"
                      className={styles.stakeLink}
                    >
                      How to stake AXL
                    </Link>
                  </>
                )}
              </p>
            </div>
            <nav className={styles.nav}>
              {STATUSES.map((s, i) => (
                <Link
                  key={i}
                  href={`/validators${s !== 'active' ? `/${s}` : ''}`}
                  className={
                    s === (status || 'active')
                      ? styles.navLinkActive
                      : styles.navLinkInactive
                  }
                >
                  {s} ({filter(s).length})
                </Link>
              ))}
            </nav>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadTr}>
                  <th
                    scope="col"
                    onClick={() => (order[0] !== 'tokens' ? orderBy('') : undefined)}
                    className={clsx(
                      order[0] !== 'tokens' ? styles.thIndexClickable : styles.thIndex
                    )}
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    onClick={() => orderBy('apr')}
                    className={styles.thDefault}
                  >
                    <div className={styles.thSortFlex}>
                      <span>Validator</span>
                      {order[0] === 'apr' && (
                        <Tooltip
                          content={`APR: ${order[1]}`}
                          className={styles.tooltipWhitespace}
                        >
                          <div className={styles.thSortIcon}>
                            {order[1] === 'asc' ? (
                              <RxCaretUp size={16} />
                            ) : (
                              <RxCaretDown size={16} />
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => orderBy('tokens')}
                    className={styles.thWhitespace}
                  >
                    <div className={styles.thSortFlex}>
                      <span>
                        {status === 'active' ? 'Consensus Power' : 'Staking'}
                      </span>
                      {order[0] === 'tokens' && (
                        <Tooltip
                          content={`${status === 'active' ? 'Consensus Power' : 'Staking'}: ${order[1]}`}
                          className={styles.tooltipWhitespace}
                        >
                          <div className={styles.thSortIcon}>
                            {order[1] === 'asc' ? (
                              <RxCaretUp size={16} />
                            ) : (
                              <RxCaretDown size={16} />
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </th>
                  {status === 'active' && (
                    <th
                      scope="col"
                      onClick={() => orderBy('quadratic_voting_power')}
                      className={styles.thWhitespace}
                    >
                      <div className={styles.thSortFlex}>
                        <span>Quadratic Power</span>
                        {order[0] === 'quadratic_voting_power' && (
                          <Tooltip
                            content={`Quadratic Power: ${order[1]}`}
                            className={styles.tooltipWhitespace}
                          >
                            <div className={styles.thSortIcon}>
                              {order[1] === 'asc' ? (
                                <RxCaretUp size={16} />
                              ) : (
                                <RxCaretDown size={16} />
                              )}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    </th>
                  )}
                  <th
                    scope="col"
                    onClick={() => orderBy('uptime')}
                    className={styles.thUptimeHidden}
                  >
                    <div className={styles.thSortFlex}>
                      <span>Uptime</span>
                      {order[0] === 'uptime' && (
                        <Tooltip
                          content={`Uptime: ${order[1]}`}
                          className={styles.tooltipWhitespace}
                        >
                          <div className={styles.thSortIcon}>
                            {order[1] === 'asc' ? (
                              <RxCaretUp size={16} />
                            ) : (
                              <RxCaretDown size={16} />
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className={styles.thEvmSupported}
                  >
                    EVM Supported
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {filter(status).map((d: ValidatorType, i: number) => {
                  const { rate } = { ...d.commission?.commission_rates };

                  const totalVotingPower = _.sumBy(filter(status), 'tokens');
                  const totalQuadraticVotingPower = _.sumBy(
                    filter(status),
                    'quadratic_voting_power'
                  );
                  const cumulativeVotingPower = _.sumBy(
                    _.slice(filter(status), 0, i + 1),
                    'tokens'
                  );
                  const cumulativeQuadraticVotingPower = _.sumBy(
                    _.slice(filter(status), 0, i + 1),
                    'quadratic_voting_power'
                  );

                  return (
                    <tr
                      key={i}
                      className={styles.tr}
                    >
                      <td className={styles.tdIndex}>
                        {i + 1}
                      </td>
                      <td className={styles.tdDefault}>
                        <div className={styles.validatorInfoCol}>
                          <Profile
                            i={i}
                            address={d.operator_address}
                            prefix="axelarvaloper"
                          />
                          <Copy value={d.operator_address}>
                            <span className={styles.operatorAddress}>
                              {ellipse(d.operator_address, 6, 'axelarvaloper')}
                            </span>
                          </Copy>
                          {isNumber(rate) && (
                            <Number
                              value={(rate as number) * 100}
                              maxDecimals={2}
                              prefix="Commission: "
                              suffix="%"
                              noTooltip={true}
                              className={styles.numberMuted}
                            />
                          )}
                          {isNumber(d.inflation) && (
                            <Number
                              value={(d.inflation as number) * 100}
                              maxDecimals={2}
                              prefix="Inflation: "
                              suffix="%"
                              noTooltip={true}
                              className={styles.numberMuted}
                            />
                          )}
                          {isNumber(d.apr) && (
                            <Number
                              value={d.apr}
                              maxDecimals={2}
                              prefix="APR: "
                              suffix="%"
                              noTooltip={true}
                              className={styles.numberMuted}
                            />
                          )}
                          {(status === 'inactive' ||
                            d.status !== 'BOND_STATUS_BONDED') && (
                            <>
                              {d.status && (
                                <Tag
                                  className={clsx(
                                    styles.tagFit,
                                    d.status.includes('UN')
                                      ? d.status.endsWith('ED')
                                        ? styles.tagUnbonded
                                        : styles.tagUnbonding
                                      : styles.tagBonded
                                  )}
                                >
                                  {d.status.replace('BOND_STATUS_', '')}
                                </Tag>
                              )}
                              {d.jailed && (
                                <Tag className={styles.tagJailed}>
                                  Jailed
                                </Tag>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className={styles.tdDefault}>
                        {isNumber(d.tokens) && (
                          <div className={styles.votingPowerGrid}>
                            <div className={styles.votingPowerRow}>
                              <Number
                                value={d.tokens}
                                format="0,0.0a"
                                noTooltip={true}
                                className={styles.votingPowerValue}
                              />
                              {status === 'active' && (
                                <Number
                                  value={(d.tokens * 100) / totalVotingPower}
                                  format="0,0.0a"
                                  prefix="("
                                  suffix="%)"
                                  noTooltip={true}
                                  className={styles.votingPowerPct}
                                />
                              )}
                            </div>
                            {status === 'active' && (
                              <ProgressBar
                                value={
                                  (cumulativeVotingPower * 100) /
                                  totalVotingPower
                                }
                              />
                            )}
                          </div>
                        )}
                      </td>
                      {status === 'active' && (
                        <td className={styles.tdDefault}>
                          {isNumber(d.quadratic_voting_power) && (
                            <div className={styles.votingPowerGrid}>
                              <div className={styles.votingPowerRow}>
                                <Number
                                  value={d.quadratic_voting_power}
                                  format="0,0.0a"
                                  noTooltip={true}
                                  className={styles.votingPowerValue}
                                />
                                <Number
                                  value={
                                    (d.quadratic_voting_power * 100) /
                                    totalQuadraticVotingPower
                                  }
                                  format="0,0.0a"
                                  prefix="("
                                  suffix="%)"
                                  noTooltip={true}
                                  className={styles.votingPowerPct}
                                />
                              </div>
                              <ProgressBar
                                value={
                                  (cumulativeQuadraticVotingPower * 100) /
                                  totalQuadraticVotingPower
                                }
                                className={styles.quadraticProgressBar}
                              />
                            </div>
                          )}
                        </td>
                      )}
                      <td className={styles.tdUptimeHidden}>
                        <div className={styles.uptimeGrid}>
                          {isNumber(d.uptime) && (
                            <ProgressBar
                              value={d.uptime}
                              className={clsx(
                                d.uptime < 50
                                  ? styles.uptimeLow
                                  : d.uptime < 80
                                    ? styles.uptimeMed
                                    : styles.uptimeHigh
                              )}
                            />
                          )}
                          {status === 'active' &&
                            isNumber(d.proposed_blocks) && (
                              <div className={styles.proposedBlockCol}>
                                <span className={styles.proposedBlockLabel}>
                                  Proposed Block
                                </span>
                                <div className={styles.proposedBlockRow}>
                                  <Number
                                    value={d.proposed_blocks}
                                    format="0,0.0a"
                                    noTooltip={true}
                                    className={styles.proposedBlockValue}
                                  />
                                  <Number
                                    value={d.proposed_blocks_proportion}
                                    format="0,0.0a"
                                    prefix="("
                                    suffix="%)"
                                    noTooltip={true}
                                    className={styles.proposedBlockPct}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className={styles.tdEvmSupported}>
                        <div className={styles.evmGrid}>
                          {toArray(chains)
                            .filter(
                              (c: Chain) => c.chain_type === 'evm' && !c.deprecated
                            )
                            .map((c: Chain) => {
                              const { votes, total, total_polls } = {
                                ...((d.votes as Record<string, unknown>)?.chains as Record<string, Record<string, unknown>> | undefined)?.[c.id],
                              } as { votes?: Record<string, number>; total?: number; total_polls?: number };

                              const isSupported = d.supportedChains?.includes(
                                c.maintainer_id ?? ''
                              );
                              const details = isSupported
                                ? (['true', 'false', 'unsubmitted'] as const)
                                    .map(s => [
                                      s === 'true'
                                        ? 'Y'
                                        : s === 'false'
                                          ? 'N'
                                          : 'UN',
                                      votes?.[s],
                                    ])
                                    .filter(([_k, v]) => v)
                                    .map(
                                      ([k, v]) =>
                                        `${numberFormat(v, '0,0')}${k}`
                                    )
                                    .join(' / ')
                                : 'Not Supported';

                              return (
                                <div key={c.id} className={styles.evmChainCell}>
                                  <Tooltip
                                    content={`${c.name}${details ? `: ${details}` : ''}`}
                                    className={styles.tooltipWhitespace}
                                  >
                                    <div className={styles.evmChainRow}>
                                      <Image
                                        src={c.image}
                                        alt=""
                                        width={20}
                                        height={20}
                                      />
                                      {!isSupported ? (
                                        <span className={styles.evmNotSupported}>
                                          Not Supported
                                        </span>
                                      ) : (
                                        <div className={styles.evmVotesRow}>
                                          <Number
                                            value={total || 0}
                                            format="0,0.0a"
                                            noTooltip={true}
                                            className={clsx(
                                              (total ?? 0) < (total_polls ?? 0)
                                                ? styles.evmVotesPartial
                                                : styles.evmVotesFull
                                            )}
                                          />
                                          <Number
                                            value={total_polls || 0}
                                            format="0,0.0a"
                                            prefix=" / "
                                            noTooltip={true}
                                            className={styles.evmVotesFull}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </Tooltip>
                                </div>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}

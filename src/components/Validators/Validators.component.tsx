'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import {
  useChains,
  useValidators,
  useInflationData,
  useNetworkParameters,
} from '@/hooks/useGlobalData';
import { getValidatorsVotes, getChainMaintainers } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';
import { isNumber, toNumber, formatUnits, toFixed } from '@/lib/number';
import type { Chain, Validator as ValidatorType } from '@/types';
import type { ValidatorsProps } from './Validators.types';
import { STATUSES } from './Validators.types';
import { useValidatorStore } from './Validators.stores';
import { SortHeader } from './SortHeader.component';
import { ValidatorRow } from './ValidatorRow.component';
import { ValidatorsHeader } from './ValidatorsHeader.component';
import * as styles from './Validators.styles';

// ─── Main Component ────────────────────────────────────────────

export function Validators({ status }: ValidatorsProps) {
  const [EVMChains, setEVMChains] = useState<Chain[] | null>(null);
  const [validatorsVotes, setValidatorsVotes] = useState<Record<
    string,
    unknown
  > | null>(null);
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
          (d: Chain) =>
            d.chain_type === 'evm' && d.gateway?.address && !d.no_inflation
        )
      );
    }
  }, [setEVMChains, chains]);

  // getChainMaintainers
  useEffect(() => {
    const getData = async () => {
      if (!EVMChains) return;

      setMaintainers(
        Object.fromEntries(
          await Promise.all(
            EVMChains.filter((d: Chain) => !maintainers?.[d.id]).map(
              (d: Chain) =>
                new Promise<[string, string[]]>(async resolve => {
                  const response = await getChainMaintainers({ chain: d.id });
                  const { maintainers } = {
                    ...(response as Record<string, unknown>),
                  };
                  resolve([d.id, toArray(maintainers) as string[]]);
                })
            )
          )
        )
      );
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
      !EVMChains ||
      !validatorsVotes ||
      !validators ||
      !inflationData ||
      !networkParameters ||
      Object.keys({ ...maintainers }).length !== EVMChains.length
    ) {
      return;
    }

    const {
      tendermintInflationRate,
      keyMgmtRelativeInflationRate,
      externalChainVotingInflationRate,
      communityTax,
    } = { ...inflationData } as Record<string, unknown>;
    const { bankSupply, stakingPool } = { ...networkParameters } as Record<
      string,
      Record<string, unknown> | undefined
    >;

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

          const getVoteCount = (
            vote: boolean | string,
            votes: Record<string, unknown>
          ) =>
            _.sum(
              Object.values({ ...votes }).map((v: unknown) =>
                toNumber(
                  _.last(
                    Object.entries({
                      ...((v as Record<string, unknown>)?.votes as Record<
                        string,
                        unknown
                      >),
                    }).find(([k, _v]) => equalsIgnoreCase(k, vote?.toString()))
                  )
                )
              )
            );

          d.total_yes_votes = getVoteCount(
            true,
            dVotes.chains as Record<string, unknown>
          );
          d.total_no_votes = getVoteCount(
            false,
            dVotes.chains as Record<string, unknown>
          );
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
            (isNumber(d.heartbeats_uptime)
              ? (d.heartbeats_uptime as number) / 100
              : 1) *
              toNumber(keyMgmtRelativeInflationRate) *
              toNumber(tendermintInflationRate) +
            toNumber(externalChainVotingInflationRate) *
              _.sum(
                supportedChains.map((c: string) => {
                  const { total, total_polls } = {
                    ...(
                      (d.votes as Record<string, unknown>)?.chains as
                        | Record<string, Record<string, unknown>>
                        | undefined
                    )?.[c],
                  } as Record<string, unknown>;
                  return (
                    1 -
                    (total_polls
                      ? ((total_polls as number) - (total as number)) /
                        (total_polls as number)
                      : 0)
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
              Object.entries({
                ...((d.votes as Record<string, unknown>).chains as Record<
                  string,
                  unknown
                >),
              }).filter(([k, _v]) => find(k, supportedChains))
            ),
          },
        };
      }),
      toArray([
        order[0],
        order[0] === 'quadratic_voting_power' && 'tokens',
      ]) as string[],
      [order[1], order[1]] as ('asc' | 'desc')[]
    );

    if (!_.isEqual(_data, data)) {
      setData(_data);
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

  if (!data) {
    return (
      <Container className={styles.container}>
        <Spinner />
      </Container>
    );
  }

  const filteredData = filter(status);

  const filterCounts = Object.fromEntries(
    STATUSES.map(s => [s, filter(s).length])
  );

  return (
    <Container className={styles.container}>
      <div>
        <ValidatorsHeader status={status} filterCounts={filterCounts} />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadTr}>
                <th
                  scope="col"
                  onClick={() =>
                    order[0] !== 'tokens' ? orderBy('') : undefined
                  }
                  className={clsx(
                    order[0] !== 'tokens'
                      ? styles.thIndexClickable
                      : styles.thIndex
                  )}
                >
                  #
                </th>
                <SortHeader
                  label="Validator"
                  sortKey="apr"
                  order={order}
                  onSort={orderBy}
                />
                <SortHeader
                  label={status === 'active' ? 'Consensus Power' : 'Staking'}
                  sortKey="tokens"
                  order={order}
                  onSort={orderBy}
                  className={styles.thWhitespace}
                />
                {status === 'active' && (
                  <SortHeader
                    label="Quadratic Power"
                    sortKey="quadratic_voting_power"
                    order={order}
                    onSort={orderBy}
                    className={styles.thWhitespace}
                  />
                )}
                <SortHeader
                  label="Uptime"
                  sortKey="uptime"
                  order={order}
                  onSort={orderBy}
                  className={styles.thUptimeHidden}
                />
                <th scope="col" className={styles.thEvmSupported}>
                  EVM Supported
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {filteredData.map((d: ValidatorType, i: number) => (
                <ValidatorRow
                  key={i}
                  validator={d}
                  index={i}
                  status={status}
                  filteredValidators={filteredData}
                  chains={chains ?? []}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

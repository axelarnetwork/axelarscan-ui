'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { toArray } from '@/lib/parser';
import type { Validator as ValidatorType } from '@/types';
import type { ValidatorsProps } from './Validators.types';
import { STATUSES } from './Validators.types';
import { useValidatorsData } from './Validators.hooks';
import { SortHeader } from './SortHeader.component';
import { ValidatorRow } from './ValidatorRow.component';
import { ValidatorsHeader } from './ValidatorsHeader.component';
import * as styles from './Validators.styles';

// ─── Main Component ────────────────────────────────────────────

export function Validators({ status, initialData = null }: ValidatorsProps) {
  const { data: result } = useValidatorsData(initialData);
  const [order, setOrder] = useState<[string, string]>(['tokens', 'desc']);

  const data = useMemo(() => {
    if (!result?.validators) return null;
    return _.orderBy(
      result.validators,
      toArray([
        order[0],
        order[0] === 'quadratic_voting_power' && 'tokens',
      ]) as string[],
      [order[1], order[1]] as ('asc' | 'desc')[]
    );
  }, [result, order]);

  const chains = result?.chains ?? [];

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
                  chains={chains}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

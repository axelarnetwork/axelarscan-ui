'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';

import { TablePagination } from '@/components/Pagination';
import type { DelegationsProps, DelegationEntry } from './Account.types';
import { DelegationRow } from './DelegationRow.component';
import * as styles from './Account.styles';

const TABS = ['delegations', 'redelegations', 'unstakings'] as const;
const SIZE_PER_PAGE = 10;

export function Delegations({ data }: DelegationsProps) {
  const [tab, setTab] = useState<string>(TABS[0]);
  const [page, setPage] = useState(1);

  const delegations = data?.delegations;
  const redelegations = data?.redelegations;
  const unbondings = data?.unbondings;

  const hasAnyData =
    (delegations?.data?.length ?? 0) > 0 ||
    (redelegations?.data?.length ?? 0) > 0 ||
    (unbondings?.data?.length ?? 0) > 0;
  if (!hasAnyData) return null;

  const selectedData = useMemo((): DelegationEntry[] => {
    switch (tab) {
      case 'delegations':
        return delegations?.data ?? [];
      case 'redelegations':
        return redelegations?.data ?? [];
      case 'unstakings':
        return unbondings?.data ?? [];
      default:
        return [];
    }
  }, [tab, delegations, redelegations, unbondings]);

  const hasData = (type: string): boolean => {
    switch (type) {
      case 'delegations':
        return (delegations?.data?.length ?? 0) > 0;
      case 'redelegations':
        return (redelegations?.data?.length ?? 0) > 0;
      case 'unstakings':
        return (unbondings?.data?.length ?? 0) > 0;
      default:
        return true;
    }
  };

  const pageStart = (page - 1) * SIZE_PER_PAGE;
  const visibleData = selectedData.slice(pageStart, pageStart + SIZE_PER_PAGE);

  return (
    <div className={styles.balancesContainer}>
      <div className={styles.tableScrollContainer}>
        <nav className={styles.tabNav}>
          {TABS.filter(hasData).map((type, i) => (
            <button
              key={i}
              onClick={() => {
                setTab(type);
                setPage(1);
              }}
              className={type === tab ? styles.tabActive : styles.tabInactive}
            >
              {type}
            </button>
          ))}
        </nav>
        <table className={styles.table}>
          <thead className={styles.tableHeadDelegations}>
            <tr className={styles.tableHeadRow}>
              <th scope="col" className={styles.thFirst}>
                #
              </th>
              <th scope="col" className={styles.thDefault}>
                Validator
              </th>
              <th
                scope="col"
                className={clsx(
                  'text-right',
                  tab === 'unstakings' ? 'px-3 py-2' : 'py-2 pl-3 pr-4 sm:pr-0'
                )}
              >
                Amount
              </th>
              {tab === 'unstakings' && (
                <th scope="col" className={styles.thUnstakingsAvailable}>
                  Available at
                </th>
              )}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {visibleData.map((d, i) => (
              <DelegationRow
                key={i}
                entry={d}
                index={pageStart + i}
                tab={tab}
              />
            ))}
          </tbody>
        </table>
      </div>
      {selectedData.length > SIZE_PER_PAGE && (
        <div className={styles.paginationWrapper}>
          <TablePagination
            data={selectedData}
            value={page}
            onChange={(p: number) => setPage(p)}
            sizePerPage={SIZE_PER_PAGE}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

import { TablePagination } from '@/components/Pagination';
import type { BalancesProps } from './Account.types';
import { BalanceRow } from './BalanceRow.component';
import * as styles from './Account.styles';

const SIZE_PER_PAGE = 10;

export function Balances({ data }: BalancesProps) {
  const [page, setPage] = useState(1);

  if (!data) return null;

  const pageStart = (page - 1) * SIZE_PER_PAGE;
  const visibleData = data.filter((_d, i) => i >= pageStart && i < pageStart + SIZE_PER_PAGE);

  return (
    <div className={styles.balancesContainer}>
      <div className={styles.tableScrollContainer}>
        <h3 className={styles.sectionTitle}>Balances</h3>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.tableHeadRow}>
              <th scope="col" className={styles.thFirst}>#</th>
              <th scope="col" className={styles.thDefault}>Asset</th>
              <th scope="col" className={styles.thRight}>Balance</th>
              <th scope="col" className={styles.thLast}>Value</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {visibleData.map((d, i) => (
              <BalanceRow key={i} entry={d} index={pageStart + i} />
            ))}
          </tbody>
        </table>
      </div>
      {data.length > SIZE_PER_PAGE && (
        <div className={styles.paginationWrapper}>
          <TablePagination data={data} value={page} onChange={(p: number) => setPage(p)} sizePerPage={SIZE_PER_PAGE} />
        </div>
      )}
    </div>
  );
}

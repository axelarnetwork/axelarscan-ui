'use client';

import { useState } from 'react';

import { TablePagination } from '@/components/Pagination';
import { RewardRow } from './RewardRow.component';
import type { RewardsTableProps } from './Verifier.types';
import * as styles from './Verifier.styles';

const REWARDS_SIZE_PER_PAGE = 10;

export function RewardsTable({ rewards }: RewardsTableProps) {
  const [rewardsPage, setRewardsPage] = useState(1);

  const pageStart = (rewardsPage - 1) * REWARDS_SIZE_PER_PAGE;
  const visibleRewards = rewards.filter(
    (_d, i) => i >= pageStart && i < pageStart + REWARDS_SIZE_PER_PAGE
  );

  return (
    <div className={styles.rewardsWrapper}>
      <div className={styles.rewardsTableScroll}>
        <table className={styles.rewardsTable}>
          <thead className={styles.rewardsTableHead}>
            <tr className={styles.rewardsTableHeadRow}>
              <th scope="col" className={styles.rewardsThFirst}>Height</th>
              <th scope="col" className={styles.rewardsThMiddle}>Chain</th>
              <th scope="col" className={styles.rewardsThRight}>Payout</th>
              <th scope="col" className={styles.rewardsThLast}>Payout at</th>
            </tr>
          </thead>
          <tbody className={styles.rewardsTableBody}>
            {visibleRewards.map((d, i) => (
              <RewardRow key={i} entry={d} />
            ))}
          </tbody>
        </table>
      </div>
      {rewards.length > REWARDS_SIZE_PER_PAGE && (
        <TablePagination
          data={rewards}
          value={rewardsPage}
          onChange={(page: number) => setRewardsPage(page)}
          sizePerPage={REWARDS_SIZE_PER_PAGE}
        />
      )}
    </div>
  );
}

import { useState } from 'react';

import { TablePagination } from '@/components/Pagination';
import { useAssets } from '@/hooks/useGlobalData';
import { numberFormat } from '@/lib/number';
import type { Delegation } from '@/types';

import { DelegationRow } from './DelegationRow.component';
import type { DelegationsTableProps } from './Validator.types';
import * as styles from './Validator.styles';

const DELEGATIONS_SIZE_PER_PAGE = 10;

export function DelegationsTable({ delegations }: DelegationsTableProps) {
  const [page, setPage] = useState(1);
  const assets = useAssets();

  const visibleDelegations = delegations.filter(
    (_d: Delegation, i: number) =>
      i >= (page - 1) * DELEGATIONS_SIZE_PER_PAGE &&
      i < page * DELEGATIONS_SIZE_PER_PAGE
  );

  return (
    <div className={styles.dlRow}>
      <dt className={styles.dlLabel}>
        {`Delegation${delegations.length > 1 ? `s (${numberFormat(delegations.length, '0,0')})` : ''}`}
      </dt>
      <dd className={styles.dlValue}>
        <div className={styles.delegationsWrapper}>
          <div className={styles.delegationsTableScroll}>
            <table className={styles.delegationsTable}>
              <thead className={styles.delegationsTableHead}>
                <tr className={styles.delegationsTableHeadRow}>
                  <th scope="col" className={styles.delegationsThFirst}>
                    Delegator
                  </th>
                  <th scope="col" className={styles.delegationsThMiddle}>
                    Amount
                  </th>
                  <th scope="col" className={styles.delegationsThLast}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className={styles.delegationsTableBody}>
                {visibleDelegations.map((d: Delegation, i: number) => (
                  <DelegationRow key={i} d={d} assets={assets} />
                ))}
              </tbody>
            </table>
          </div>
          {delegations.length > DELEGATIONS_SIZE_PER_PAGE && (
            <TablePagination
              data={delegations}
              value={page}
              onChange={(p: number) => setPage(p)}
              sizePerPage={DELEGATIONS_SIZE_PER_PAGE}
            />
          )}
        </div>
      </dd>
    </div>
  );
}

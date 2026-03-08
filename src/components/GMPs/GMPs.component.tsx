'use client';

import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';

import { Filters } from './Filters.component';
import { GMPRow } from './GMPRow.component';
import { useGMPSearch } from './GMPs.hooks';
import type { GMPsProps, GMPRowData } from './GMPs.types';
import * as styles from './GMPs.styles';

const SIZE = 25;

export function GMPs({
  initialData = null,
  address,
  useAnotherHopChain = false,
}: GMPsProps) {
  const {
    data: result,
    isFetching,
    refetch,
  } = useGMPSearch(initialData, address);

  const data = result?.data;
  const total = result?.total;

  if (!data) {
    return (
      <Container className={styles.containerDefault}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerDefault}>
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>General Message Passing</h1>
            <p className={styles.headerSubtitle}>
              <Number
                value={total}
                suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.headerActions}>
            {!address && <Filters />}
            <Button color="default" circle="true" onClick={() => refetch()}>
              <MdOutlineRefresh
                size={20}
                className={isFetching ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>
        <div className={styles.tableScrollContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>
                  Tx Hash
                </th>
                <th scope="col" className={styles.thDefault}>
                  Method
                </th>
                <th scope="col" className={styles.thDefault}>
                  Sender
                </th>
                <th scope="col" className={styles.thDefault}>
                  Destination
                </th>
                <th scope="col" className={styles.thDefault}>
                  Status
                </th>
                <th scope="col" className={styles.thLast}>
                  Created at
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {data.map((d: GMPRowData) => (
                <GMPRow
                  key={d.message_id || d.call.transactionHash}
                  data={d}
                  useAnotherHopChain={useAnotherHopChain}
                />
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > SIZE && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={SIZE} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

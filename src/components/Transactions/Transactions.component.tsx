'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination, TablePagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';

import type {
  TransactionsProps,
  TransactionRowData,
} from './Transactions.types';
import { PAGE_SIZE, SIZE_PER_PAGE } from './Transactions.types';
import { Filters } from './Filters.component';
import { TransactionRow } from './TransactionRow.component';
import { useTransactionsSearch } from './Transactions.hooks';
import * as styles from './Transactions.styles';

export function Transactions({
  initialData = null,
  height,
  address,
}: TransactionsProps) {
  const [page, setPage] = useState(1);
  const chains = useChains();

  const {
    data: result,
    isFetching,
    refetch,
  } = useTransactionsSearch(initialData, height, address);

  const data = result?.data;
  const total = result?.total;

  if (!data) {
    return (
      <Container
        className={clsx(
          height
            ? styles.containerHeight
            : address
              ? styles.containerAddress
              : styles.containerDefault
        )}
      >
        <Spinner />
      </Container>
    );
  }

  return (
    <Container
      className={clsx(
        height
          ? styles.containerHeight
          : address
            ? styles.containerAddress
            : styles.containerDefault
      )}
    >
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Transactions</h1>
            {!height && (
              <p className={styles.headerSubtitle}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
            {!height && <Filters address={address} />}
            <Button color="default" circle="true" onClick={() => refetch()}>
              <MdOutlineRefresh
                size={20}
                className={isFetching ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>
        <div
          className={clsx(
            styles.tableScrollContainer,
            height || address
              ? styles.tableScrollContainerNoMargin
              : styles.tableScrollContainerMargin
          )}
        >
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th scope="col" className={styles.thFirst}>
                  Tx Hash
                </th>
                {!height && (
                  <th scope="col" className={styles.thDefault}>
                    Height
                  </th>
                )}
                <th scope="col" className={styles.thDefault}>
                  Type
                </th>
                <th scope="col" className={styles.thDefault}>
                  Status
                </th>
                <th scope="col" className={styles.thDefault}>
                  Sender
                </th>
                {!!address && (
                  <th scope="col" className={styles.thDefault}>
                    Recipient
                  </th>
                )}
                {!(height || address) && (
                  <th scope="col" className={styles.thRight}>
                    Fee
                  </th>
                )}
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {(height
                ? data.filter(
                    (_d: TransactionRowData, i: number) =>
                      i >= (page - 1) * SIZE_PER_PAGE &&
                      i < page * SIZE_PER_PAGE
                  )
                : data
              ).map((d: TransactionRowData, i: number) => (
                <TransactionRow
                  key={i}
                  data={d}
                  height={height}
                  address={address}
                  chains={chains}
                />
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > (height ? SIZE_PER_PAGE : PAGE_SIZE) && (
          <div className={styles.paginationWrapper}>
            {height ? (
              <TablePagination
                data={data}
                value={page}
                onChange={(page: number) => setPage(page)}
                sizePerPage={SIZE_PER_PAGE}
              />
            ) : (
              <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

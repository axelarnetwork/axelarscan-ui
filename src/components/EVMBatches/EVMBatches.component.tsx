'use client';

import Link from 'next/link';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';

import type { BatchRecord, EVMBatchesProps } from './EVMBatches.types';
import { PAGE_SIZE } from './EVMBatches.types';
import { useEVMBatchesSearch } from './EVMBatches.hooks';
import { BatchRow } from './BatchRow.component';
import { Filters } from './Filters.component';
import * as styles from './EVMBatches.styles';

export function EVMBatches({ initialData = null }: EVMBatchesProps) {
  const {
    data: result,
    isFetching,
    refetch,
  } = useEVMBatchesSearch(initialData);
  const chains = useChains();
  const assets = useAssets();

  const data = result?.data;
  const total = result?.total;

  if (!data) {
    return (
      <Container className={styles.containerClass}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.containerClass}>
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerAuto}>
            <div className={styles.headingRow}>
              <h1 className={styles.pageTitle}>EVM Batches</h1>
              <span className={styles.titleSeparator}>|</span>
              <Link href="/amplifier-proofs" className={styles.amplifierLink}>
                Amplifier Proofs
              </Link>
            </div>
            <p className={styles.resultText}>
              <Number
                value={total}
                suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.actionsRow}>
            <Filters />
            <Button color="default" circle="true" onClick={() => refetch()}>
              <MdOutlineRefresh
                size={20}
                className={isFetching ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  ID
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Chain
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Commands
                </th>
                <th scope="col" className={styles.thRight}>
                  Status
                </th>
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d: BatchRecord) => (
                <BatchRow
                  key={d.batch_id}
                  batch={d}
                  chains={chains}
                  assets={assets}
                />
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > PAGE_SIZE && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

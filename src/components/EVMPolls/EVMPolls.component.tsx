'use client';

import Link from 'next/link';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';

import { Filters } from './Filters.component';
import { PollRow } from './PollRow.component';
import { useEVMPollsSearch } from './EVMPolls.hooks';
import type { EVMPollsProps, ProcessedPoll } from './EVMPolls.types';
import * as styles from './EVMPolls.styles';

const SIZE = 25;

export function EVMPolls({ initialData = null }: EVMPollsProps) {
  const { data: result, isFetching, refetch } = useEVMPollsSearch(initialData);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

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
              <h1 className={styles.pageTitle}>EVM Polls</h1>
              <span className={styles.titleSeparator}>|</span>
              <Link href="/amplifier-polls" className={styles.amplifierLink}>
                Amplifier Polls
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
                  Event
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Height
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Status
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Participations
                </th>
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d: ProcessedPoll) => (
                <PollRow
                  key={d.id}
                  poll={d}
                  chains={chains}
                  assets={assets}
                  validators={validators}
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

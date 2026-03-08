'use client';

import Link from 'next/link';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';

import type {
  AmplifierPollsProps,
  AmplifierPollEntry,
} from './AmplifierPolls.types';
import { Filters } from './Filters.component';
import { PollRow } from './PollRow.component';
import { useAmplifierPollsSearch } from './AmplifierPolls.hooks';
import * as styles from './AmplifierPolls.styles';

const SIZE = 25;

export function AmplifierPolls({ initialData = null }: AmplifierPollsProps) {
  const {
    data: result,
    isFetching,
    refetch,
  } = useAmplifierPollsSearch(initialData);
  const chains = useChains();

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
              <Link href="/evm-polls" className={styles.evmPollsLink}>
                EVM Polls
              </Link>
              <span className={styles.titleSeparator}>|</span>
              <h1 className={styles.pageTitle}>Amplifier Polls</h1>
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
              {data.map((d: AmplifierPollEntry) => (
                <PollRow key={d.id} poll={d} chains={chains} />
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

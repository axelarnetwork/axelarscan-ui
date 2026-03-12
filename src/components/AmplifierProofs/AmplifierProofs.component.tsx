'use client';

import Link from 'next/link';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';

import type { AmplifierProofsProps } from './AmplifierProofs.types';
import { useAmplifierProofsSearch } from './AmplifierProofs.hooks';
import { Filters } from './Filters.component';
import { ProofsTable } from './ProofsTable.component';
import * as styles from './AmplifierProofs.styles';

const SIZE = 25;

export function AmplifierProofs({ initialData = null }: AmplifierProofsProps) {
  const {
    data: result,
    isFetching,
    refetch,
  } = useAmplifierProofsSearch(initialData);
  const chains = useChains();

  const data = result?.data;
  const total = result?.total ?? 0;

  if (!data) {
    return (
      <Container className={styles.proofsContainer}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.proofsContainer}>
      <div>
        <div className={styles.proofsHeaderRow}>
          <div className={styles.proofsHeaderLeft}>
            <div className={styles.proofsNavLinks}>
              <Link href="/evm-batches" className={styles.evmBatchesLink}>
                EVM Batches
              </Link>
              <span className={styles.navDivider}>|</span>
              <h1 className={styles.proofsTitle}>Amplifier Proofs</h1>
            </div>
            <p className={styles.proofsSubtitle}>
              <Number value={total} suffix={` result${total > 1 ? 's' : ''}`} />
            </p>
          </div>
          <div className={styles.proofsActions}>
            <Filters />
            <Button color="default" circle="true" onClick={() => refetch()}>
              <MdOutlineRefresh
                size={20}
                className={isFetching ? 'animate-spin' : ''}
              />
            </Button>
          </div>
        </div>
        <ProofsTable data={data} chains={chains} />
        {total > SIZE && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={SIZE} total={total} />
          </div>
        )}
      </div>
    </Container>
  );
}

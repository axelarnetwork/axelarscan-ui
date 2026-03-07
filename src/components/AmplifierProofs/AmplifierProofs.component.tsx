'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useChains } from '@/hooks/useGlobalData';
import { getRPCStatus, searchAmplifierProofs } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';

import type {
  BlockData,
  SearchResult,
} from './AmplifierProofs.types';
import { Filters } from './Filters.component';
import { ProofsTable } from './ProofsTable.component';
import * as styles from './AmplifierProofs.styles';
import { buildProofEntry } from './AmplifierProofs.utils';

const size = 25;

export function AmplifierProofs() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<string, SearchResult> | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => setBlockData(await getRPCStatus() as BlockData);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh) || !blockData) return;

      const response = await searchAmplifierProofs({ ...params, size }) as
        Record<string, unknown> | undefined;
      const { data, total } = {
        ...(response as { data?: unknown[]; total?: number }),
      };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: _.orderBy(
            toArray(data).map((d) => buildProofEntry(d, blockData)),
            ['created_at.ms'],
            ['desc']
          ),
          total: total ?? 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, blockData]);

  const { data, total = 0 } = { ...searchResults?.[generateKeyByParams(params!)] };

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
              <Number
                value={total}
                suffix={` result${total > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className={styles.proofsActions}>
            <Filters />
            {refresh ? (
              <Spinner />
            ) : (
              <Button
                color="default"
                circle="true"
                onClick={() => setRefresh(true)}
              >
                <MdOutlineRefresh size={20} />
              </Button>
            )}
          </div>
        </div>
        {refresh && <Overlay />}
        <ProofsTable data={data} chains={chains} />
        {total > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total} />
          </div>
        )}
      </div>
    </Container>
  );
}


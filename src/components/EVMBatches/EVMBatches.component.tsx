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
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchBatches } from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';

import type {
  BatchRecord,
  BatchSearchResponse,
  SearchResultsMap,
} from './EVMBatches.types';
import { PAGE_SIZE } from './EVMBatches.types';
import { BatchRow } from './BatchRow.component';
import { Filters } from './Filters.component';
import * as styles from './EVMBatches.styles';

export function EVMBatches() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResultsMap | null>(
    null
  );
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, PAGE_SIZE);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh)) return;

      let response = (await searchBatches({
        ...params,
        size: PAGE_SIZE,
      })) as BatchSearchResponse | null;

      if (
        response &&
        !response.data &&
        !['mainnet', 'testnet'].includes(ENVIRONMENT!)
      ) {
        response = { data: [], total: 0 };
      }

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: { ...response },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params!)] };

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

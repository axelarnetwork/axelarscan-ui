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
import { useChains, useAssets, useValidators } from '@/hooks/useGlobalData';
import { searchEVMPolls } from '@/lib/api/validator';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';

import { Filters } from './Filters.component';
import { PollRow } from './PollRow.component';
import type {
  EVMPollRecord,
  ProcessedPoll,
  SearchResults,
} from './EVMPolls.types';
import * as styles from './EVMPolls.styles';
import { processPolls } from './EVMPolls.utils';

const size = 25;

export function EVMPolls() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const chains = useChains();
  const assets = useAssets();
  const validators = useValidators();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh)) return;

      const response = (await searchEVMPolls({ ...params, size })) as Record<
        string,
        unknown
      > | null;
      const { data: rawData, total } = { ...response } as {
        data?: unknown;
        total?: number;
      };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: _.orderBy(
            processPolls(rawData as EVMPollRecord[], chains),
            ['idNumber', 'created_at.ms'],
            ['desc', 'desc']
          ),
          total: total || 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, chains]);

  const { data, total } = {
    ...searchResults?.[generateKeyByParams(params ?? {})],
  };

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
        {(total ?? 0) > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

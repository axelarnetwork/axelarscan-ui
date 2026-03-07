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
import { getRPCStatus, searchAmplifierPolls } from '@/lib/api/validator';
import { toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';
import type { AmplifierPollEntry } from './AmplifierPolls.types';
import { Filters } from './Filters.component';
import { PollRow } from './PollRow.component';
import * as styles from './AmplifierPolls.styles';
import { processPollData } from './AmplifierPolls.utils';

const size = 25;

export function AmplifierPolls() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<
    string,
    { data: AmplifierPollEntry[]; total: number }
  > | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [blockData, setBlockData] = useState<{
    latest_block_height?: number;
    [key: string]: unknown;
  } | null>(null);
  const chains = useChains();

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () =>
      setBlockData((await getRPCStatus()) as Record<string, unknown>);
    getData();
  }, [setBlockData]);

  useEffect(() => {
    const getData = async () => {
      if (!params || !toBoolean(refresh) || !blockData) return;

      const response = (await searchAmplifierPolls({ ...params, size })) as
        | { data?: AmplifierPollEntry[]; total?: number }
        | undefined;
      const { data, total } = { ...response };

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          data: processPollData(
            toArray(data) as AmplifierPollEntry[],
            blockData.latest_block_height ?? 0
          ),
          total: total ?? 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh, blockData, chains]);

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
        {(total ?? 0) > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

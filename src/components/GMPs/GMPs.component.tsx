'use client';

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
import { THIRTY_SECONDS_MS } from '@/lib/constants';
import { searchGMP } from '@/lib/api/gmp';
import { toArray } from '@/lib/parser';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';

import { Filters } from './Filters.component';
import { GMPRow } from './GMPRow.component';
import type { GMPsProps, GMPRowData } from './GMPs.types';
import * as styles from './GMPs.styles';
import { customData } from './GMPs.utils';

const size = 25;

export function GMPs({
  address = undefined,
  useAnotherHopChain = false,
}: GMPsProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [refresh, setRefresh] = useState<boolean | string | null>(null);

  useEffect(() => {
    const _params = getParams(searchParams, size);

    if (address) {
      _params.address = address;
    }

    if (!_.isEqual(_params, params)) {
      setParams(_params);
      setRefresh(true);
    }
  }, [address, searchParams, params, setParams]);

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined;

        const _params = _.cloneDeep(params);
        delete _params.sortBy;

        const response = (await searchGMP({
          ..._params,
          size,
          sort,
        })) as Record<string, unknown>;

        if (response?.data) {
          response.data = await Promise.all(
            toArray(response.data as unknown[]).map(
              (d: unknown) =>
                new Promise(async resolve =>
                  resolve(await customData(d as GMPRowData))
                )
            )
          );
        }

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyByParams(params)]: { ...response },
        });

        setRefresh(false);
      }
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), THIRTY_SECONDS_MS);
    return () => clearInterval(interval);
  }, []);

  const { data, total } = {
    ...(searchResults?.[generateKeyByParams(params ?? {})] as
      | Record<string, unknown>
      | undefined),
  } as { data?: GMPRowData[]; total?: number };

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
            {refresh && refresh !== 'true' ? (
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
        {refresh && refresh !== 'true' && <Overlay />}
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
        {(total ?? 0) > size && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={size} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

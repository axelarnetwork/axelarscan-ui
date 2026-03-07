'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useAssets } from '@/hooks/useGlobalData';
import { searchTransfers } from '@/lib/api/token-transfer';
import { ENVIRONMENT } from '@/lib/config';
import { getParams, generateKeyByParams } from '@/lib/operator';
import { toBoolean } from '@/lib/string';
import { isNumber } from '@/lib/number';

import { Filters } from './Filters.component';
import { TransferRow } from './TransferRow.component';
import type {
  TransfersProps,
  TransferSearchResults,
  TransferSearchResult,
  TransferRowData,
} from './Transfers.types';
import * as styles from './Transfers.styles';

const size = 25;

export const normalizeType = (type: string | undefined) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type as string)
    ? 'deposit_service'
    : type || 'deposit_address';

export function Transfers({ address }: TransfersProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] =
    useState<TransferSearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | string | null>(null);
  const assets = useAssets();

  useEffect(() => {
    const _params = getParams(searchParams, size) as Record<string, unknown>;

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
      if (!params || !toBoolean(refresh)) return;

      const sort =
        params.sortBy === 'value' ? { 'send.value': 'desc' } : undefined;

      if (params.from === 0) {
        delete params.from;
      }

      const _params = _.cloneDeep(params);
      delete _params.sortBy;

      const response = (await searchTransfers({
        ..._params,
        size,
        sort,
      })) as TransferSearchResult | null;

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params)]: {
          ...(response?.total ||
          (Object.keys(_params).length > 0 &&
            !(
              Object.keys(_params).length === 1 && _params.from !== undefined
            )) ||
          ENVIRONMENT !== 'mainnet'
            ? response
            : searchResults?.[generateKeyByParams(params)]),
        },
      });
      setRefresh(
        !isNumber(response?.total) &&
          !searchResults?.[generateKeyByParams(params)] &&
          ENVIRONMENT === 'mainnet'
          ? true
          : false
      );
    };

    getData();
  }, [params, setSearchResults, refresh, setRefresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const { data, total } = {
    ...searchResults?.[generateKeyByParams(params as Record<string, unknown>)],
  } as TransferSearchResult;

  return (
    <Container className={styles.transfersContainer}>
      <div role="alert" className={styles.deprecationBanner}>
        <PiWarningCircle size={20} aria-hidden="true" />
        <span className={styles.deprecationBannerText}>
          Legacy Token Transfers are deprecated.
        </span>
      </div>
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className={styles.transfersHeaderRow}>
            <div className={styles.transfersHeaderLeft}>
              <h1 className={styles.transfersTitle}>Token Transfers</h1>
              <p className={styles.transfersSubtitle}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className={styles.transfersActions}>
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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.theadTr}>
                  <th scope="col" className={styles.thTxHash}>
                    Tx Hash
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Method
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Source
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Destination
                  </th>
                  <th scope="col" className={styles.thDefault}>
                    Status
                  </th>
                  <th scope="col" className={styles.thCreatedAt}>
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d: TransferRowData) => (
                  <TransferRow key={d.send.txhash} d={d} assets={assets} />
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
      )}
    </Container>
  );
}

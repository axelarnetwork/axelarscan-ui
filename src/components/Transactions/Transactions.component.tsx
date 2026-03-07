'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { MdOutlineRefresh } from 'react-icons/md';

import { Container } from '@/components/Container';
import { Overlay } from '@/components/Overlay';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination, TablePagination } from '@/components/Pagination';
import { useChains, useAssets } from '@/hooks/useGlobalData';
import { searchTransactions, getTransactions } from '@/lib/api/validator';
import { searchDepositAddresses } from '@/lib/api/token-transfer';
import {
  axelarContracts,
  getAxelarContractAddresses,
} from '@/lib/config';
import {
  getIcapAddress,
  getInputType,
  toArray,
} from '@/lib/parser';
import {
  getParams,
  generateKeyByParams,
} from '@/lib/operator';
import {
  equalsIgnoreCase,
  toBoolean,
  find,
} from '@/lib/string';

import type { TransactionsProps, SearchResults, TransactionRowData, TransactionData } from './Transactions.types';
import { PAGE_SIZE, SIZE_PER_PAGE } from './Transactions.types';
import { Filters } from './Filters.component';
import { TransactionRow } from './TransactionRow.component';
import { getType, getSender, getRecipient } from './Transactions.utils';
import * as styles from './Transactions.styles';

export function Transactions({ height, address }: TransactionsProps) {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
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
      if (!params || !toBoolean(refresh) || !chains || !assets) return;

      const addressType = getInputType(address as string | number, chains);

      let data: TransactionData[] | undefined;
      let total: number | undefined;

      if (height) {
        const response = await getTransactions({
          events: `tx.height=${height}`,
        }) as { data?: TransactionData[]; total?: number } | null;

        if (response) {
          data = response.data;
          total = response.total;
        }
      } else if (
        ((address as string | undefined)?.length !== undefined && (address as string).length >= 65 || addressType === 'evmAddress') &&
        !find(
          address!,
          _.concat(axelarContracts, getAxelarContractAddresses(chains))
        )
      ) {
        const depositResponse = await searchDepositAddresses({ address }) as { data?: Array<{ deposit_address?: string }> } | null;
        const { deposit_address } = {
          ...depositResponse?.data?.[0],
        };

        if (deposit_address || addressType === 'evmAddress') {
          let qAddress = equalsIgnoreCase(address, deposit_address)
            ? deposit_address
            : address;

          let response: { data?: TransactionData[]; total?: number } | null;

          switch (addressType) {
            case 'axelarAddress':
              response = await getTransactions({
                events: `message.sender='${qAddress}'`,
              }) as { data?: TransactionData[]; total?: number } | null;

              if (response) {
                data = response.data;
              }

              response = await getTransactions({
                events: `transfer.recipient='${qAddress}'`,
              }) as { data?: TransactionData[]; total?: number } | null;

              if (response) {
                data = _.concat(toArray<TransactionData>(response.data), toArray<TransactionData>(data));
              }
              break;
            case 'evmAddress':
              qAddress = getIcapAddress(qAddress);

              response = await searchTransactions({
                ...params,
                address: qAddress,
                size: PAGE_SIZE,
              }) as { data?: TransactionData[]; total?: number } | null;

              if (response) {
                data = response.data;
              }
              break;
            default:
              break;
          }

          response = await getTransactions({
            events: `link.depositAddress='${qAddress}'`,
          }) as { data?: TransactionData[]; total?: number } | null;

          if (response) {
            data = _.concat(toArray<TransactionData>(response.data), toArray<TransactionData>(data));
          }

          total = data?.length;
        } else {
          const response = await searchTransactions({
            ...params,
            address,
            size: PAGE_SIZE,
          }) as { data?: TransactionData[]; total?: number } | null;

          if (response) {
            data = response.data;
            total = response.total;
          }
        }
      } else {
        const response = await searchTransactions({
          ...params,
          address: (params as Record<string, unknown>).address || address,
          size: PAGE_SIZE,
        }) as { data?: TransactionData[]; total?: number } | null;

        if (response) {
          data = response.data;
          total = response.total;
        }
      }

      setSearchResults({
        ...(refresh ? undefined : searchResults),
        [generateKeyByParams(params!)]: {
          data: _.orderBy(
            _.uniqBy(toArray<TransactionData>(data), 'txhash').map((d): TransactionRowData => ({
              ...d,
              type: getType(d),
              sender: getSender(d, assets),
              recipient: getRecipient(d, assets),
            })),
            ['height', 'timestamp', 'txhash'],
            ['desc', 'desc', 'asc']
          ),
          total: total ?? 0,
        },
      });
      setRefresh(false);
    };

    getData();
  }, [
    height,
    address,
    params,
    setSearchResults,
    refresh,
    setRefresh,
    chains,
    assets,
  ]);

  const { data, total } = { ...searchResults?.[generateKeyByParams(params ?? {})] };

  if (!data) {
    return (
      <Container
        className={clsx(
          height ? styles.containerHeight : address ? styles.containerAddress : styles.containerDefault
        )}
      >
        <Spinner />
      </Container>
    );
  }

  return (
    <Container
      className={clsx(
        height ? styles.containerHeight : address ? styles.containerAddress : styles.containerDefault
      )}
    >
      <div>
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              Transactions
            </h1>
            {!height && (
              <p className={styles.headerSubtitle}>
                <Number
                  value={total}
                  suffix={` result${(total ?? 0) > 1 ? 's' : ''}`}
                />
              </p>
            )}
          </div>
          <div className={styles.headerActions}>
            {!height && <Filters address={address} />}
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
        <div
          className={clsx(
            styles.tableScrollContainer,
            height || address ? styles.tableScrollContainerNoMargin : styles.tableScrollContainerMargin
          )}
        >
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr className={styles.tableHeadRow}>
                <th
                  scope="col"
                  className={styles.thFirst}
                >
                  Tx Hash
                </th>
                {!height && (
                  <th scope="col" className={styles.thDefault}>
                    Height
                  </th>
                )}
                <th scope="col" className={styles.thDefault}>
                  Type
                </th>
                <th scope="col" className={styles.thDefault}>
                  Status
                </th>
                <th scope="col" className={styles.thDefault}>
                  Sender
                </th>
                {!!address && (
                  <th scope="col" className={styles.thDefault}>
                    Recipient
                  </th>
                )}
                {!(height || address) && (
                  <th scope="col" className={styles.thRight}>
                    Fee
                  </th>
                )}
                <th
                  scope="col"
                  className={styles.thLast}
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {(height
                ? data.filter(
                    (_d: TransactionRowData, i: number) =>
                      i >= (page - 1) * SIZE_PER_PAGE && i < page * SIZE_PER_PAGE
                  )
                : data
              ).map((d: TransactionRowData, i: number) => (
                <TransactionRow key={i} data={d} height={height} address={address} chains={chains} />
              ))}
            </tbody>
          </table>
        </div>
        {(total ?? 0) > (height ? SIZE_PER_PAGE : PAGE_SIZE) && (
          <div className={styles.paginationWrapper}>
            {height ? (
              <TablePagination
                data={data}
                value={page}
                onChange={(page: number) => setPage(page)}
                sizePerPage={SIZE_PER_PAGE}
              />
            ) : (
              <Pagination sizePerPage={PAGE_SIZE} total={total ?? 0} />
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

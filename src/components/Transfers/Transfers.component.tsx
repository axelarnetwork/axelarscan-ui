'use client';

import { MdOutlineRefresh } from 'react-icons/md';
import { PiWarningCircle } from 'react-icons/pi';

import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Pagination } from '@/components/Pagination';
import { useAssets } from '@/hooks/useGlobalData';

import { Filters } from './Filters.component';
import { TransferRow } from './TransferRow.component';
import { useTransfersSearch } from './Transfers.hooks';
import type { TransfersProps, TransferRowData } from './Transfers.types';
import * as styles from './Transfers.styles';

const SIZE = 25;

export function Transfers({ initialData = null, address }: TransfersProps) {
  const {
    data: result,
    isFetching,
    refetch,
  } = useTransfersSearch(initialData, address);
  const assets = useAssets();

  const data = result?.data;
  const total = result?.total;

  if (!data) {
    return (
      <Container className={styles.transfersContainer}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className={styles.transfersContainer}>
      <div role="alert" className={styles.deprecationBanner}>
        <PiWarningCircle size={20} aria-hidden="true" />
        <span className={styles.deprecationBannerText}>
          Legacy Token Transfers are deprecated.
        </span>
      </div>
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
        {(total ?? 0) > SIZE && (
          <div className={styles.paginationWrapper}>
            <Pagination sizePerPage={SIZE} total={total ?? 0} />
          </div>
        )}
      </div>
    </Container>
  );
}

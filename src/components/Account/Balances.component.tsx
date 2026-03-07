'use client';

import { useState } from 'react';

import { Image } from '@/components/Image';
import { Copy } from '@/components/Copy';
import { Number } from '@/components/Number';
import { TablePagination } from '@/components/Pagination';
import { useAssets } from '@/hooks/useGlobalData';
import { getAssetData } from '@/lib/config';
import { ellipse } from '@/lib/string';
import type { BalancesProps, BalanceEntry } from './Account.types';
import * as styles from './Account.styles';

const SIZE_PER_PAGE = 10;

function BalanceRow({ entry, index }: { entry: BalanceEntry; index: number }) {
  const assets = useAssets();
  const burnedPrefix = 'burned-';
  const { symbol, image, price } = { ...getAssetData(entry.denom?.replace(burnedPrefix, ''), assets) };
  const isBurned = entry.denom?.startsWith(burnedPrefix);

  return (
    <tr className={styles.tableRow}>
      <td className={styles.tdIndex}>{index + 1}</td>
      <td className={styles.tdDefault}>
        <div className={styles.assetCell}>
          <Image src={image} alt="" width={16} height={16} />
          {(symbol || entry.denom) && (
            <div className={styles.assetInfo}>
              <div className={styles.assetNameWrapper}>
                <span className={styles.assetName}>
                  {isBurned ? 'Burned ' : ''}
                  {ellipse(symbol || entry.denom, 6, 'ibc/')}
                </span>
                {!symbol && <Copy size={16} value={entry.denom} />}
              </div>
              {price! > 0 && (
                <Number value={price!} maxDecimals={2} prefix="$" className={styles.assetPrice} />
              )}
            </div>
          )}
        </div>
      </td>
      <td className={styles.tdRight}>
        <div className={styles.cellEndAligned}>
          <Number value={entry.amount} className={styles.balanceValue} />
        </div>
      </td>
      <td className={styles.tdLast}>
        <div className={styles.cellEndAligned}>
          {price! > 0 && (
            <Number value={entry.amount * price!} prefix="$" noTooltip={true} className={styles.balanceUsdValue} />
          )}
        </div>
      </td>
    </tr>
  );
}

export function Balances({ data }: BalancesProps) {
  const [page, setPage] = useState(1);

  if (!data) return null;

  const pageStart = (page - 1) * SIZE_PER_PAGE;
  const visibleData = data.filter((_d, i) => i >= pageStart && i < pageStart + SIZE_PER_PAGE);

  return (
    <div className={styles.balancesContainer}>
      <div className={styles.tableScrollContainer}>
        <h3 className={styles.sectionTitle}>Balances</h3>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.tableHeadRow}>
              <th scope="col" className={styles.thFirst}>#</th>
              <th scope="col" className={styles.thDefault}>Asset</th>
              <th scope="col" className={styles.thRight}>Balance</th>
              <th scope="col" className={styles.thLast}>Value</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {visibleData.map((d, i) => (
              <BalanceRow key={i} entry={d} index={pageStart + i} />
            ))}
          </tbody>
        </table>
      </div>
      {data.length > SIZE_PER_PAGE && (
        <div className={styles.paginationWrapper}>
          <TablePagination data={data} value={page} onChange={(p: number) => setPage(p)} sizePerPage={SIZE_PER_PAGE} />
        </div>
      )}
    </div>
  );
}

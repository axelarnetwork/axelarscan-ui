'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { searchBlocks } from '@/lib/api/validator';
import { toBoolean } from '@/lib/string';
import { numberFormat } from '@/lib/number';
import * as styles from './Blocks.styles';
import type { BlockEntry, BlocksProps } from './Blocks.types';
import { BlockRow } from './BlockRow.component';

const SIZE = 250;

export function Blocks({ height = undefined }: BlocksProps) {
  const [data, setData] = useState<BlockEntry[] | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (toBoolean(refresh)) {
        const response = (await searchBlocks({ height, size: SIZE })) as
          | { data?: BlockEntry[] }
          | undefined;
        const { data: responseData } = { ...response };

        if (responseData) {
          setData(responseData);
          setRefresh(false);
        }
      }
    };

    getData();
  }, [height, refresh]);

  useEffect(() => {
    const interval = setInterval(() => setRefresh(true), 6 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div>
        <div className="sm:flex-auto">
          <h1 className={styles.pageTitle}>Blocks</h1>
          <p className={styles.pageDescription}>
            Latest {numberFormat(SIZE, '0,0')} Blocks
          </p>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  Height
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Hash
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Proposer
                </th>
                <th scope="col" className={styles.thTxCount}>
                  No. Transactions
                </th>
                <th scope="col" className={styles.thLast}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d, i) => (
                <BlockRow key={d.height} block={d} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

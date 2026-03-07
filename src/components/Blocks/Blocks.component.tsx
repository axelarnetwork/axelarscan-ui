'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Copy } from '@/components/Copy';
import { Spinner } from '@/components/Spinner';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { searchBlocks } from '@/lib/api/validator';
import { toBoolean, ellipse } from '@/lib/string';
import { numberFormat } from '@/lib/number';
import * as styles from './Blocks.styles';

const SIZE = 250;

interface BlockEntry {
  height: number;
  hash?: string;
  proposer_address?: string;
  num_txs?: number;
  time?: string;
}

export function Blocks({ height = undefined }: { height?: string }) {
  const [data, setData] = useState<BlockEntry[] | null>(null);
  const [refresh, setRefresh] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (toBoolean(refresh)) {
        const response = await searchBlocks({ height, size: SIZE }) as { data?: BlockEntry[] } | undefined;
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

  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
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
                  <th scope="col" className={styles.thFirst}>Height</th>
                  <th scope="col" className={styles.thMiddle}>Hash</th>
                  <th scope="col" className={styles.thMiddle}>Proposer</th>
                  <th scope="col" className={styles.thTxCount}>No. Transactions</th>
                  <th scope="col" className={styles.thLast}>Time</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map((d, i) => (
                  <tr key={d.height} className={styles.row}>
                    <td className={styles.tdFirst}>
                      <div className={styles.heightWrapper}>
                        <Copy value={d.height}>
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className={styles.heightLink}
                          >
                            <Number value={d.height} />
                          </Link>
                        </Copy>
                      </div>
                    </td>
                    <td className={styles.tdMiddle}>
                      {d.hash && (
                        <Copy value={d.hash}>
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className={styles.hashLink}
                          >
                            {ellipse(d.hash)}
                          </Link>
                        </Copy>
                      )}
                    </td>
                    <td className={styles.tdMiddle}>
                      <Profile i={i} address={d.proposer_address} />
                    </td>
                    <td className={styles.tdTxCount}>
                      <Number
                        value={d.num_txs}
                        className={styles.txCountValue}
                      />
                    </td>
                    <td className={styles.tdLast}>
                      <TimeAgo timestamp={d.time} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}

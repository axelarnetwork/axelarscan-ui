'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { searchTransfers } from '@/lib/api/token-transfer';
import { getParams } from '@/lib/operator';
import { REFRESH_INTERVAL_MS } from './Transfer.constants';
import { Info } from './Info.component';
import { Details } from './Details.component';
import { isTerminalStatus, makeErrorData } from './Transfer.utils';
import type { TransferData, TransferProps } from './Transfer.types';
import * as styles from './Transfer.styles';

// Re-export for external consumers (index.ts)
export { getStep } from './Transfer.utils';

export function Transfer({ tx, lite, initialData }: TransferProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TransferData | null>(
    () => initialData?.data?.[0] ?? null
  );
  const [ended, setEnded] = useState<boolean | null>(() => {
    const first = initialData?.data?.[0];
    return first ? isTerminalStatus(first.simplified_status) : null;
  });

  useEffect(() => {
    const getData = async () => {
      const { transferId } = { ...getParams(searchParams) } as Record<
        string,
        string
      >;

      if (tx) {
        if (!ended) {
          const { data } = {
            ...((await searchTransfers({ txHash: tx })) as {
              data?: TransferData[];
            }),
          };
          const d = data?.[0];

          if (d) {
            if (isTerminalStatus(d.simplified_status)) {
              setEnded(true);
            }

            setData(d);
          } else {
            setData(makeErrorData(`Transaction: ${tx} not found`));
          }
        }
      } else if (transferId) {
        const { data } = {
          ...((await searchTransfers({ transferId })) as {
            data?: TransferData[];
          }),
        };
        const d = data?.[0];

        if (d) {
          if (d.send?.txhash) {
            router.push(`/transfer/${d.send.txhash}`);
          } else {
            setData(d);
          }
        } else {
          setData(makeErrorData(`Transfer ID: ${transferId} not found`));
        }
      }
    };

    getData();

    const interval = !ended && setInterval(() => getData(), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval as ReturnType<typeof setInterval>);
  }, [tx, router, searchParams, setData, ended, setEnded]);

  if (!data) {
    return (
      <Container className={styles.transferContainer}>
        <Spinner />
      </Container>
    );
  }

  if (data.status === 'errorOnGetData') {
    return (
      <Container className={styles.transferContainer}>
        <Response data={data} />
      </Container>
    );
  }

  return (
    <Container className={styles.transferContainer}>
      <div className={styles.transferContent}>
        <Info data={data} tx={tx} />
        {!lite && <Details data={data} />}
      </div>
    </Container>
  );
}

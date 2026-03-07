'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';
import { Response } from '@/components/Response';
import { searchTransfers } from '@/lib/api/token-transfer';
import { getParams } from '@/lib/operator';
import { Info } from './Info.component';
import { Details } from './Details.component';
import type { TransferData, TransferProps } from './Transfer.types';
import * as styles from './Transfer.styles';

// Re-export for external consumers (index.ts)
export { getStep } from './Transfer.utils';

function isTerminalStatus(status?: string): boolean {
  return ['received', 'failed'].includes(status ?? '');
}

function makeErrorData(message: string): TransferData {
  return {
    status: 'errorOnGetData',
    code: 404,
    message,
  };
}

export function Transfer({ tx, lite }: TransferProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TransferData | null>(null);
  const [ended, setEnded] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      const { transferId } = { ...getParams(searchParams) } as Record<string, string>;

      if (tx) {
        if (!ended) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = { ...(await searchTransfers({ txHash: tx })) as any } as { data?: TransferData[] };
          const d = data?.[0];

          if (d) {
            if (isTerminalStatus(d.simplified_status)) {
              setEnded(true);
            }

            console.log('[data]', d);
            setData(d);
          } else {
            setData(makeErrorData(`Transaction: ${tx} not found`));
          }
        }
      } else if (transferId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = { ...(await searchTransfers({ transferId })) as any } as { data?: TransferData[] };
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

    const interval = !ended && setInterval(() => getData(), 0.5 * 60 * 1000);
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

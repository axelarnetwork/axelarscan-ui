'use client';

import { useEffect, useState } from 'react';

import { Container } from '@/components/Container';
import { useAssets } from '@/hooks/useGlobalData';
import { Response } from '@/components/Response';
import { Spinner } from '@/components/Spinner';
import { getSender, getType } from '@/components/Transactions';
import { getTransaction } from '@/lib/api/validator';
import type { TransactionData, TransactionProps } from './Transaction.types';
import { Info } from './Info.component';
import { Data } from './Data.component';
import * as styles from './Transaction.styles';

export function Transaction({ tx }: TransactionProps) {
  const [data, setData] = useState<TransactionData | null>(null);
  const assets = useAssets();

  useEffect(() => {
    const getData = async () => {
      const { tx_response } = {
        ...((await getTransaction(tx)) as { tx_response?: TransactionData }),
      };

      let responseData = tx_response;

      if (responseData) {
        responseData = {
          ...responseData,
          type: getType(responseData),
          sender: getSender(responseData, assets),
        };

        setData(responseData);
      } else {
        setData({
          status: 'errorOnGetData',
          code: 404,
          message: `Transaction: ${tx} not found`,
        });
      }
    };

    getData();
  }, [tx, assets]);

  if (!data) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  if (data.status === 'errorOnGetData') {
    return (
      <Container className="sm:mt-8">
        <Response data={data} />
      </Container>
    );
  }

  return (
    <Container className="sm:mt-8">
      <div className={styles.transactionContent}>
        <Info data={data} tx={tx} />
        <Data data={data} />
      </div>
    </Container>
  );
}

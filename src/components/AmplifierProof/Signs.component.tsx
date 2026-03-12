'use client';

import { useEffect, useState } from 'react';
import _ from 'lodash';

import { useVerifiers } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import { equalsIgnoreCase, find } from '@/lib/string';

import type {
  SignsProps,
  ProofSign,
  VerifierEntry,
} from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';
import { SignRow } from './SignRow.component';

export function Signs({ data }: SignsProps) {
  const [signs, setSigns] = useState<ProofSign[] | null>(null);
  const verifiers = useVerifiers();

  useEffect(() => {
    if (!data?.signs) return;

    const signsList: ProofSign[] = data.signs.map(d => ({
      ...d,
      verifierData: (toArray(verifiers) as VerifierEntry[]).find(v =>
        equalsIgnoreCase(v.address, d.signer)
      ) || { address: d.signer },
    }));

    const unsubmitted: ProofSign[] = (toArray(data.participants) as string[])
      .filter(
        p =>
          !find(
            p,
            signsList
              .map(s => s.verifierData?.address)
              .filter(Boolean) as string[]
          )
      )
      .map(p => {
        const verifierData = (toArray(verifiers) as VerifierEntry[]).find(v =>
          equalsIgnoreCase(v.address, p)
        );

        return {
          signer: verifierData?.address || p,
          verifierData,
        };
      });

    setSigns(_.concat(signsList, unsubmitted));
  }, [data, setSigns, verifiers]);

  const { confirmation_txhash } = { ...data };

  if (!signs) return null;

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr className={styles.theadRow}>
            <th scope="col" className={styles.thFirst}>
              #
            </th>
            <th scope="col" className={styles.thMiddle}>
              Signer
            </th>
            <th scope="col" className={styles.thMiddleNowrap}>
              Tx Hash
            </th>
            <th scope="col" className={styles.thMiddle}>
              Height
            </th>
            <th scope="col" className={styles.thRight}>
              Sign
            </th>
            <th scope="col" className={styles.thLast}>
              Time
            </th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {signs.map((d: ProofSign, i: number) => (
            <SignRow
              key={i}
              sign={d}
              index={i}
              confirmationTxhash={confirmation_txhash}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

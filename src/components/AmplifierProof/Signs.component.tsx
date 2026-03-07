'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { IoCheckmarkDoneCircle } from 'react-icons/io5';

import { Copy } from '@/components/Copy';
import { Tag } from '@/components/Tag';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { TimeAgo } from '@/components/Time';
import { useVerifiers } from '@/hooks/useGlobalData';
import { toArray } from '@/lib/parser';
import {
  equalsIgnoreCase,
  find,
  ellipse,
  toTitle,
} from '@/lib/string';

import type { SignsProps, ProofSign, VerifierEntry } from './AmplifierProof.types';
import * as styles from './AmplifierProof.styles';

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
            signsList.map(s => s.verifierData?.address).filter(Boolean) as string[]
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
            <th
              scope="col"
              className={styles.thMiddleNowrap}
            >
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
          {signs.map((d: ProofSign, i: number) => {
            const sign = d.sign ? 'signed' : 'unsubmitted';

            return (
              <tr
                key={i}
                className={styles.tr}
              >
                <td className={styles.tdFirst}>{i + 1}</td>
                <td className={styles.tdMiddle}>
                  {d.verifierData ? (
                    <Profile i={i} address={d.verifierData.address} />
                  ) : (
                    <Copy value={d.signer}>
                      <Link
                        href={`/verifier/${d.signer}`}
                        target="_blank"
                        className={styles.signerLink}
                      >
                        {ellipse(d.signer, 10, '0x')}
                      </Link>
                    </Copy>
                  )}
                </td>
                <td className={styles.tdMiddle}>
                  {d.id && (
                    <div className={styles.txHashWrapper}>
                      <Copy value={d.id}>
                        <Link
                          href={`/tx/${d.id}`}
                          target="_blank"
                          className={styles.txHashLink}
                        >
                          {ellipse(d.id, 6)}
                        </Link>
                      </Copy>
                      {equalsIgnoreCase(d.id, confirmation_txhash) && (
                        <Link
                          href={`/tx/${confirmation_txhash}`}
                          target="_blank"
                          className={styles.confirmationRow}
                        >
                          <IoCheckmarkDoneCircle
                            size={18}
                            className={styles.confirmationIcon}
                          />
                          <span className={styles.confirmationLabel}>
                            Confirmation
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </td>
                <td className={styles.tdMiddle}>
                  {d.height && (
                    <Link
                      href={`/block/${d.height}`}
                      target="_blank"
                      className={styles.blockLink}
                    >
                      <Number value={d.height} />
                    </Link>
                  )}
                </td>
                <td className={styles.tdRight}>
                  <div className={styles.signWrapper}>
                    <Tag
                      className={clsx(
                        styles.statusTagBase,
                        ['signed'].includes(sign)
                          ? styles.signOptionSigned
                          : styles.signOptionUnsubmitted
                      )}
                    >
                      {toTitle(sign)}
                    </Tag>
                  </div>
                </td>
                <td className={styles.tdLast}>
                  <TimeAgo timestamp={d.created_at} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

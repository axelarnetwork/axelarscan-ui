'use client';

import Link from 'next/link';

import { Container } from '@/components/Container';
import { Spinner } from '@/components/Spinner';

import { useVerifiersData } from './Verifiers.hooks';
import type { VerifiersProps } from './Verifiers.types';
import { VerifierRow } from './Row.component';
import * as styles from './Verifiers.styles';

export function Verifiers({ initialData = null }: VerifiersProps) {
  const { data: result } = useVerifiersData(initialData);

  if (!result) {
    return (
      <Container className="sm:mt-8">
        <Spinner />
      </Container>
    );
  }

  const {
    verifiers: data,
    amplifierChains,
    additionalAmplifierChains,
  } = result;

  return (
    <Container className="sm:mt-8">
      <div>
        <div className={styles.headerWrapper}>
          <div className="sm:flex-auto">
            <div className={styles.navLinks}>
              <Link href="/validators" className={styles.validatorsLink}>
                Validators
              </Link>
              <span className={styles.navDivider}>|</span>
              <h1 className={styles.pageTitle}>Verifiers</h1>
            </div>
            <p className={styles.pageDescription}>
              List of active verifiers in Axelar Network with the latest 10K
              blocks performance.
            </p>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.theadRow}>
                <th scope="col" className={styles.thFirst}>
                  #
                </th>
                <th scope="col" className={styles.thMiddle}>
                  Verifier
                </th>
                <th scope="col" className={styles.thLast}>
                  Amplifier Supported
                </th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.map((d, i) => (
                <VerifierRow
                  key={d.address}
                  verifier={d}
                  index={i}
                  amplifierChains={amplifierChains}
                  additionalAmplifierChains={additionalAmplifierChains}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}

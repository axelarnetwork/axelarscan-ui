'use client';

import Link from 'next/link';
import clsx from 'clsx';

import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { useChains } from '@/hooks/useGlobalData';
import { getChainData } from '@/lib/config';
import { toArray } from '@/lib/parser';
import { numberFormat } from '@/lib/number';
import type { SignsProps, VerifierSignEntry } from './Verifier.types';
import * as styles from './Verifier.styles';

const SIZE = 200;

export function Signs({ data }: SignsProps) {
  const chains = useChains();
  const entries = toArray(data) as VerifierSignEntry[];

  if (!data || data.length === 0) return null;

  const totalSigned = entries.filter(d => typeof d.sign === 'boolean' && d.sign).length;
  const totalUN = entries.filter(d => typeof d.sign !== 'boolean').length;
  const totalSigns = Object.fromEntries(
    Object.entries({ S: totalSigned, UN: totalUN }).filter(([_k, v]) => v || _k === 'S')
  );

  const participationRate = (entries.filter(d => typeof d.sign === 'boolean').length * 100) / data.length;
  const summaryPrefix = `${Object.keys(totalSigns).length > 1 ? '(' : ''}${Object.entries(totalSigns)
    .map(([k, v]) => `${numberFormat(v, '0,0')}${k === 'S' ? '' : k}`)
    .join(' : ')}${Object.keys(totalSigns).length > 1 ? ')' : ''}/`;

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h3 className={styles.sectionTitle}>Amplifier Signings</h3>
          <p className={styles.sectionSubtitle}>Latest {numberFormat(SIZE, '0,0')} Signings</p>
        </div>
        <div className={styles.sectionHeaderRight}>
          <Number value={participationRate} suffix="%" className={styles.sectionTitle} />
          <Number value={data.length} format="0,0" prefix={summaryPrefix} className={styles.sectionSubtitle} />
        </div>
      </div>
      <div className={styles.blockGrid}>
        {data.map((d, i) => {
          const { name } = { ...getChainData(d.chain || d.destination_chain, chains) };
          const tooltipContent = d.session_id ? `Session ID: ${d.session_id} (${name})` : numberFormat(d.height, '0,0');

          return (
            <Link key={i} href={d.id ? `/amplifier-proof/${d.id}` : `/block/${d.height}`} target="_blank" className={styles.blockLink}>
              <Tooltip content={tooltipContent} className={styles.chainTooltip}>
                <div className={clsx(styles.blockDot, styles.getSignDotStyle(d.sign))} />
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import clsx from 'clsx';
import moment from 'moment';
import Link from 'next/link';
// @ts-expect-error — no type declarations available
import Linkify from 'react-linkify';

import { Copy } from '@/components/Copy';
import { useChains } from '@/hooks/useGlobalData';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { Tag } from '@/components/Tag';
import { getChainData } from '@/lib/config';
import { formatUnits } from '@/lib/number';
import { ellipse, spacedSuffix } from '@/lib/string';
import { TIME_FORMAT } from '@/lib/time';
import type { InfoProps } from './Transaction.types';
import * as styles from './Transaction.styles';

export function Info({ data, tx }: InfoProps) {
  const chains = useChains();

  const { height, type, code, sender, timestamp, gas_used, gas_wanted } = {
    ...data,
  };
  const { fee } = { ...data.tx?.auth_info } as {
    fee?: { amount?: { amount?: string; denom?: string }[] };
  };
  const { memo } = { ...data.tx?.body } as { memo?: string };
  const feeSymbol = (
    getChainData('axelarnet', chains)?.native_token as
      | { symbol?: string }
      | undefined
  )?.symbol;

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={tx}>{ellipse(tx, 16)}</Copy>
        </h3>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.infoDivider}>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Height</dt>
            <dd className={styles.infoValue}>
              <Link
                href={`/block/${height}`}
                target="_blank"
                className={styles.blockLink}
              >
                <Number value={height} />
              </Link>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Type</dt>
            <dd className={styles.infoValue}>
              {type && <Tag className={styles.typeTag}>{type}</Tag>}
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Status</dt>
            <dd className={styles.infoValue}>
              <Tag
                className={clsx(
                  code ? styles.statusTagFailed : styles.statusTagSuccess
                )}
              >
                {code ? 'Failed' : 'Success'}
              </Tag>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Sender</dt>
            <dd className={styles.infoValue}>
              <Profile address={sender} />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Created</dt>
            <dd className={styles.infoValue}>
              {moment(timestamp).format(TIME_FORMAT)}
            </dd>
          </div>
          {fee && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Fee</dt>
              <dd className={styles.infoValue}>
                <Number
                  value={formatUnits(fee.amount?.[0]?.amount, 6)}
                  format="0,0.00000000"
                  suffix={spacedSuffix(feeSymbol)}
                  noTooltip={true}
                  className={styles.feeNumber}
                />
              </dd>
            </div>
          )}
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Gas Used</dt>
            <dd className={styles.infoValue}>
              <Number
                value={gas_used}
                format="0,0"
                className={styles.gasNumber}
              />
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoLabel}>Gas Limit</dt>
            <dd className={styles.infoValue}>
              <Number
                value={gas_wanted}
                format="0,0"
                className={styles.gasNumber}
              />
            </dd>
          </div>
          {memo && (
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Memo</dt>
              <dd className={styles.infoValue}>
                <div className={styles.memoWrapper}>
                  <Linkify>{memo}</Linkify>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

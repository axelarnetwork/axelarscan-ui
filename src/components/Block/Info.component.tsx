'use client';

import Link from 'next/link';
import moment from 'moment';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { find, ellipse } from '@/lib/string';
import { isNumber, toNumber, numberFormat } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import { toArray } from '@/lib/parser';
import type { InfoProps, ValidatorSetEntry } from './Block.types';
import { SignerSection } from './SignerSection.component';
import * as styles from './Block.styles';

export function Info({ data, height, validatorSets }: InfoProps) {
  const { hash } = { ...data.block_id };
  const { proposer_address, time } = { ...data.block?.header };
  const { txs } = { ...data.block?.data };

  const signedValidatorsData = (
    toArray(validatorSets) as ValidatorSetEntry[]
  ).filter(d => d.address && find(d.address, data.validators as string[]));
  const unsignedValidatorsData = (
    toArray(validatorSets) as ValidatorSetEntry[]
  ).filter(d => !d.address || !find(d.address, data.validators as string[]));

  const totalValidators =
    signedValidatorsData.length + unsignedValidatorsData.length;
  const showSignerSection = validatorSets && totalValidators > 0;

  return (
    <div className={styles.infoPanel}>
      <div className={styles.infoHeader}>
        <h3 className={styles.infoTitle}>
          <Copy value={height}>
            <Number value={height} format="0,0" />
          </Copy>
        </h3>
        <div className={styles.navWrapper}>
          <Tooltip content={numberFormat(toNumber(height) - 1, '0,0')}>
            <Link
              href={`/block/${toNumber(height) - 1}`}
              className={styles.navButton}
            >
              <MdArrowBackIosNew size={14} />
            </Link>
          </Tooltip>
          <Tooltip content={numberFormat(toNumber(height) + 1, '0,0')}>
            <Link
              href={`/block/${toNumber(height) + 1}`}
              className={styles.navButton}
            >
              <MdArrowForwardIos size={14} />
            </Link>
          </Tooltip>
        </div>
      </div>
      <div className={styles.infoBorder}>
        <dl className={styles.dlDivide}>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Hash</dt>
            <dd className={styles.ddValue}>
              {hash && (
                <Copy value={hash}>
                  <span>{ellipse(hash)}</span>
                </Copy>
              )}
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Proposer</dt>
            <dd className={styles.ddValue}>
              <Profile address={proposer_address} />
            </dd>
          </div>
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>Block Time</dt>
            <dd className={styles.ddValue}>
              {time && moment(time).format(TIME_FORMAT)}
            </dd>
          </div>
          {isNumber(data.round) && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Round</dt>
              <dd className={styles.ddValue}>{data.round}</dd>
            </div>
          )}
          {showSignerSection && (
            <div className={styles.dlRow}>
              <dt className={styles.dtLabel}>Signer / Absent</dt>
              <dd className={styles.ddValue}>
                <SignerSection
                  signedValidatorsData={signedValidatorsData}
                  unsignedValidatorsData={unsignedValidatorsData}
                />
              </dd>
            </div>
          )}
          <div className={styles.dlRow}>
            <dt className={styles.dtLabel}>No. Transactions</dt>
            <dd className={styles.ddValue}>
              {txs && (
                <Number
                  value={txs.length}
                  format="0,0"
                  className={styles.txCountValue}
                />
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

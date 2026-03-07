'use client';

import Link from 'next/link';
import { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { Copy } from '@/components/Copy';
import { Tooltip } from '@/components/Tooltip';
import { Number } from '@/components/Number';
import { Profile } from '@/components/Profile';
import { find, ellipse } from '@/lib/string';
import { isNumber, toNumber, numberFormat } from '@/lib/number';
import { TIME_FORMAT } from '@/lib/time';
import { toArray } from '@/lib/parser';
import type { InfoProps, ValidatorSetEntry } from './Block.types';
import * as styles from './Block.styles';

function ValidatorList({ validators }: { validators: ValidatorSetEntry[] }) {
  return (
    <div className={styles.signerGrid}>
      {validators.map((d, i) => (
        <Profile
          key={i}
          i={i}
          address={d.operator_address}
          width={20}
          height={20}
          className="text-xs"
        />
      ))}
    </div>
  );
}

export function Info({ data, height, validatorSets }: InfoProps) {
  const [signedCollpased, setSignedCollpased] = useState(true);

  const { hash } = { ...data.block_id };
  const { proposer_address, time } = { ...data.block?.header };
  const { txs } = { ...data.block?.data };

  const signedValidatorsData = (toArray(validatorSets) as ValidatorSetEntry[]).filter(d =>
    d.address && find(d.address, data.validators as string[])
  );
  const unsignedValidatorsData = (toArray(validatorSets) as ValidatorSetEntry[]).filter(
    d => !d.address || !find(d.address, data.validators as string[])
  );

  const totalValidators = signedValidatorsData.length + unsignedValidatorsData.length;
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
                <div className={styles.signerSection}>
                  <button
                    onClick={() => setSignedCollpased(!signedCollpased)}
                    className={styles.signerToggle}
                  >
                    <Number
                      value={
                        (_.sumBy(signedValidatorsData, 'tokens') * 100) /
                        _.sumBy(
                          _.concat(signedValidatorsData, unsignedValidatorsData),
                          'tokens'
                        )
                      }
                      prefix={`${signedValidatorsData.length} (`}
                      suffix="%)"
                      noTooltip={true}
                    />
                    <span>/</span>
                    <Number value={unsignedValidatorsData.length} format="0,0" />
                    <div className={styles.caretWrapper}>
                      {signedCollpased ? <RxCaretDown size={18} /> : <RxCaretUp size={18} />}
                    </div>
                  </button>
                  {!signedCollpased && (
                    <div className={styles.signerSection}>
                      <div className={styles.signerSubsection}>
                        <span className={styles.signerLabel}>Signed by</span>
                        <ValidatorList validators={signedValidatorsData} />
                      </div>
                      {unsignedValidatorsData.length > 0 && (
                        <div className={styles.signerSubsection}>
                          <span className={styles.signerLabel}>Missing</span>
                          <ValidatorList validators={unsignedValidatorsData} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

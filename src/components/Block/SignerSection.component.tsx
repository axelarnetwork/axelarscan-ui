'use client';

import { useMemo, useState } from 'react';
import _ from 'lodash';
import { RxCaretDown, RxCaretUp } from 'react-icons/rx';

import { Number } from '@/components/Number';
import { ValidatorList } from './ValidatorList.component';
import type { SignerSectionProps } from './Block.types';
import * as styles from './Block.styles';

export function SignerSection({
  signedValidatorsData,
  unsignedValidatorsData,
}: SignerSectionProps) {
  const [collapsed, setCollapsed] = useState(true);

  const signedPercent = useMemo(() => {
    const totalTokens =
      _.sumBy(signedValidatorsData, 'tokens') +
      _.sumBy(unsignedValidatorsData, 'tokens');
    return totalTokens > 0
      ? (_.sumBy(signedValidatorsData, 'tokens') * 100) / totalTokens
      : 0;
  }, [signedValidatorsData, unsignedValidatorsData]);

  return (
    <div className={styles.signerSection}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={styles.signerToggle}
      >
        <Number
          value={signedPercent}
          prefix={`${signedValidatorsData.length} (`}
          suffix="%)"
          noTooltip={true}
        />
        <span>/</span>
        <Number value={unsignedValidatorsData.length} format="0,0" />
        <div className={styles.caretWrapper}>
          {collapsed ? <RxCaretDown size={18} /> : <RxCaretUp size={18} />}
        </div>
      </button>
      {!collapsed && (
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
  );
}

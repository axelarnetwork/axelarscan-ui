'use client';

import { toTitle } from '@/lib/string';

import { infoStyles } from './Info.styles';
import { useRecoveryButtons } from './RecoveryButtons.hooks';
import { recoveryButtonsStyles } from './RecoveryButtons.styles';
import { RecoveryButtonsProps } from './RecoveryButtons.types';

export function RecoveryButtons(props: RecoveryButtonsProps) {
  const entries = useRecoveryButtons(props);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={infoStyles.section}>
      <dt className={infoStyles.label}>Recovery</dt>
      <dd className={infoStyles.value}>
        <div className={recoveryButtonsStyles.list}>
          {entries.map(([key, node]) => (
            <div key={key} className={recoveryButtonsStyles.item}>
              <span className={recoveryButtonsStyles.label}>
                {toTitle(key)}:
              </span>
              <div className={recoveryButtonsStyles.value}>{node}</div>
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}

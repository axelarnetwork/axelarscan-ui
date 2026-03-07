'use client';

import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';

import type { OptionContentProps } from './AmplifierProofs.types';
import * as styles from './AmplifierProofs.styles';

export function OptionContent({ selected, active, title }: OptionContentProps) {
  return (
    <>
      <span
        className={clsx(
          styles.selectTruncate,
          selected ? styles.optionTextSelected : styles.optionTextNormal
        )}
      >
        {title}
      </span>
      {selected && (
        <span
          className={clsx(
            styles.optionCheckWrapper,
            active ? styles.optionCheckActive : styles.optionCheckInactive
          )}
        >
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}

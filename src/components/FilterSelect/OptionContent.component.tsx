'use client';

import clsx from 'clsx';
import { MdCheck } from 'react-icons/md';

import type { OptionContentProps } from './FilterSelect.types';
import * as styles from './FilterSelect.styles';

export function OptionContent({ selected, active, title }: OptionContentProps) {
  return (
    <>
      <span
        className={clsx(
          styles.selectTruncate,
          selected
            ? styles.selectOptionTextSelected
            : styles.selectOptionTextNormal
        )}
      >
        {title}
      </span>
      {selected && (
        <span
          className={clsx(
            styles.selectCheckWrapper,
            active ? styles.selectCheckActive : styles.selectCheckInactive
          )}
        >
          <MdCheck size={20} />
        </span>
      )}
    </>
  );
}

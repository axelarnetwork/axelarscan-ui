'use client';

import clsx from 'clsx';

import { mobileNavIcon } from './Header.styles';
import type { MobileNavIconProps } from './Header.types';

export function MobileNavIcon({ open }: MobileNavIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={mobileNavIcon.svg}
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          mobileNavIcon.pathTransition,
          open && mobileNavIcon.pathHidden
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          mobileNavIcon.pathTransition,
          !open && mobileNavIcon.pathHidden
        )}
      />
    </svg>
  );
}

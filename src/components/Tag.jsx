'use client';

import clsx from 'clsx';

export function Tag({ children, className }) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-blue-600 px-2.5 py-1 font-display text-xs font-medium text-white dark:bg-blue-500',
        className
      )}
    >
      {children}
    </div>
  );
}

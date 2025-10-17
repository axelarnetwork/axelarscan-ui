import clsx from 'clsx';

/**
 * Styles for the custom balance item component
 */

export const customBalanceItemStyles = {
  container: 'flex flex-col items-end',
  link: 'contents text-green-600 dark:text-green-500',
} as const;

/**
 * Get number class based on whether there's a URL
 */
export function getCustomBalanceNumberClass(hasUrl: boolean): string {
  return clsx(
    '!text-2xs font-semibold',
    !hasUrl && 'text-zinc-700 dark:text-zinc-300'
  );
}

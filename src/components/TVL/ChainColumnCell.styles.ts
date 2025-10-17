import clsx from 'clsx';

/**
 * Styles for the chain column cell component
 */

export const chainColumnCellStyles = {
  cell: 'px-3 py-4 text-right',
  container: 'flex flex-col items-end gap-y-1',
  amountContainer: 'flex flex-col items-end gap-y-0.5',

  // Link styles
  link: 'contents text-blue-600 dark:text-blue-500',

  // Number component styles
  value: 'text-xs font-medium text-zinc-400 dark:text-zinc-500',
} as const;

/**
 * Get amount number class based on whether there's a URL
 */
export function getAmountNumberClass(hasUrl: boolean): string {
  return clsx(
    'text-xs font-semibold',
    !hasUrl && 'text-zinc-700 dark:text-zinc-300'
  );
}

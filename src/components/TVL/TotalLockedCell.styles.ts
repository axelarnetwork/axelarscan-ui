import clsx from 'clsx';

/**
 * Styles for the total locked cell component
 */

export const totalLockedCellStyles = {
  container: 'flex flex-col items-end gap-y-1',
  row: 'flex items-center space-x-1',

  // Link styles
  link: 'contents text-blue-600 dark:text-blue-500',

  // Tooltip styles
  tooltip: 'w-56 text-left text-xs',
  infoIcon: 'mb-0.5 text-zinc-400 dark:text-zinc-500',

  // Number component styles
  value: 'text-sm font-medium leading-4 text-zinc-400 dark:text-zinc-500',
} as const;

/**
 * Get number element class based on whether there's a URL
 */
export function getTotalNumberClass(hasUrl: boolean): string {
  return clsx(
    'text-sm font-semibold leading-4',
    !hasUrl && 'text-zinc-700 dark:text-zinc-300'
  );
}

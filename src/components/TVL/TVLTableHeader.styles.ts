import clsx from 'clsx';

/**
 * Styles for the TVL table header
 */

export const tableHeaderStyles = {
  thead: 'sticky top-0 z-20 bg-white dark:bg-zinc-900',
  headerRow: 'text-sm font-semibold text-zinc-800 dark:text-zinc-200',

  // Column cells
  headerCell: {
    left: 'px-3 py-4 text-left',
    right: 'px-3 py-4 text-right',
    leftNoWrap: 'whitespace-nowrap px-3 py-4 text-left',
  },

  // Column content wrappers
  columnContent: {
    base: 'flex flex-col gap-y-0.5',
    alignEnd: 'flex flex-col items-end gap-y-0.5',
  },

  // Text elements
  columnLabel: 'whitespace-nowrap',
  spacer: 'h-4',

  // Chain header specific
  chainHeader: 'flex min-w-max items-center gap-x-1.5',

  // Summary number styling
  summaryNumber: 'text-xs text-green-600 dark:text-green-500',
  chainValue: 'text-xs font-medium text-zinc-400 dark:text-zinc-500',
} as const;

/**
 * Switch component styles for ITS toggle
 */
export const switchStyles = {
  group: '!gap-x-1.5',
  outer: '!h-4 !w-8',
  inner: '!h-3 !w-3',
  label: 'h-4 flex items-center',
} as const;

/**
 * Get title class for ITS switch based on state
 */
export function getSwitchTitleClass(includeITS: boolean): string {
  return clsx(
    'text-xs !font-normal',
    !includeITS && '!text-zinc-400 dark:!text-zinc-500'
  );
}

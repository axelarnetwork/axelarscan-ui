import clsx from 'clsx';

/**
 * Styles for the TopItem component
 */

export const topItemStyles = {
  container: 'flex items-center justify-between gap-x-2',
  keys: {
    container: (type: string) =>
      clsx(
        'flex items-center gap-x-1',
        ['asset', 'contract', 'address'].includes(type) ? 'h-8' : 'h-6'
      ),
    chain: {
      container: 'flex items-center gap-x-1.5',
      name: {
        single: 'text-xs font-medium text-zinc-700 dark:text-zinc-300',
        multiple:
          'hidden text-xs font-medium text-zinc-700 dark:text-zinc-300 2xl:hidden',
      },
    },
    chainMultiple: {
      container: 'flex items-center gap-x-1',
      arrow: 'text-zinc-700 dark:text-zinc-300',
    },
  },
  value: 'text-xs font-semibold text-zinc-900 dark:text-zinc-100',
} as const;

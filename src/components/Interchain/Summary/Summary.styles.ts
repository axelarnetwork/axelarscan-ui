import clsx from 'clsx';

/**
 * Styles for the Summary component
 */

export const summaryStyles = {
  container:
    'border-b border-b-zinc-200 dark:border-b-zinc-700 lg:border-t lg:border-t-zinc-200 lg:dark:border-t-zinc-700',
  grid: 'mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0',
  stat: {
    container: (isFirst: boolean) =>
      clsx(
        'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 lg:border-t-0 xl:px-8',
        !isFirst && 'sm:border-l-0'
      ),
    label: 'text-sm font-medium leading-6 text-zinc-400 dark:text-zinc-500',
    value: {
      container: 'w-full flex-none',
      number:
        '!text-3xl font-medium leading-10 tracking-tight text-zinc-900 dark:text-zinc-100',
    },
    breakdown: {
      container: 'mt-1 grid w-full grid-cols-2 gap-x-2',
      item: 'text-xs text-zinc-400 dark:text-zinc-500',
    },
  },
} as const;

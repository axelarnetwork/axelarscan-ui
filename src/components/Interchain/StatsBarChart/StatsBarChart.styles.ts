import clsx from 'clsx';

/**
 * Styles for the StatsBarChart component
 */

export const statsBarChartColors = {
  gmp: '#ff7d20',
  transfers: '#009ef7',
  transfers_airdrop: '#de3163',
} as const;

export const statsBarChartStyles = {
  container: (i: number) =>
    clsx(
      'flex flex-col gap-y-2 border-l border-r border-t border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8',
      i % 2 !== 0 ? 'sm:border-l-0' : ''
    ),
  header: {
    container: 'flex items-start justify-between gap-x-4',
    titleContainer: 'flex flex-col gap-y-0.5',
    title: 'text-base font-semibold text-zinc-900 dark:text-zinc-100',
    description: 'hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block',
    valueContainer: 'flex flex-col items-end gap-y-0.5',
    valueNumber: '!text-base font-semibold text-zinc-900 dark:text-zinc-100',
    timeString: 'whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500',
  },
  chart: {
    container: '-mb-2.5 h-64 w-full',
    loading: 'flex h-full w-full items-center justify-center',
  },
} as const;


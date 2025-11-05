import clsx from 'clsx';

/**
 * Styles for the SankeyChart component
 */

export const sankeyChartColors = {
  tooltip: {
    background: {
      dark: '#18181b',
      light: '#f4f4f5',
    },
    text: {
      dark: '#f4f4f5',
      light: '#18181b',
    },
  },
  label: {
    dark: '#f4f4f5',
    light: '#18181b',
  },
} as const;

export const sankeyChartStyles = {
  container: (i: number, noBorder: boolean) =>
    clsx(
      'flex flex-col gap-y-2 border-zinc-200 dark:border-zinc-700',
      i % 2 !== 0 ? 'sm:border-l-0' : '',
      !noBorder
        ? 'border-l border-r border-t px-4 py-8 sm:px-6 xl:px-8'
        : 'w-full'
    ),
  header: {
    container: 'flex items-start justify-between gap-x-4',
    titleContainer: 'flex flex-col gap-y-0.5',
    title: 'text-base font-semibold text-zinc-900 dark:text-zinc-100',
    description: 'hidden text-sm font-normal text-zinc-400 dark:text-zinc-500 lg:block',
    valueContainer: 'flex flex-col items-end gap-y-0.5',
    valueNumber: '!text-base font-semibold text-zinc-900 dark:text-zinc-100',
    valueKey: 'whitespace-nowrap text-right text-sm text-zinc-400 dark:text-zinc-500',
  },
  chart: {
    container: '-mb-2.5 h-full w-full',
    loading: 'flex h-full w-full items-center justify-center',
    wrapper: (className?: string) => clsx('h-112 w-full font-semibold', className),
  },
  linkTooltip: {
    container: 'flex flex-col space-y-0.5 rounded-sm bg-zinc-100 px-2 py-1.5 text-xs shadow-sm dark:bg-black',
    header: 'flex items-center space-x-2',
    colorSquare: 'h-3 w-3',
    label: 'font-bold',
    value: 'text-center',
  },
} as const;


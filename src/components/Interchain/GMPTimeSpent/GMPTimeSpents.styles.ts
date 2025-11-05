/**
 * Styles for the GMPTimeSpents component
 */

export const gmpTimeSpentsStyles = {
  container: 'flex flex-col gap-y-4 border border-zinc-200 px-4 py-8 dark:border-zinc-700 sm:px-6 xl:px-8',
  header: {
    container: 'flex items-start justify-between gap-x-4',
    titleContainer: 'flex flex-col gap-y-0.5',
    title: 'text-base font-semibold text-zinc-900 dark:text-zinc-100',
    description: 'text-sm font-normal text-zinc-400 dark:text-zinc-500',
  },
  grid: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
} as const;


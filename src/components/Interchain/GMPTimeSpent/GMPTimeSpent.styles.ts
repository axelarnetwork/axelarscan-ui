/**
 * Styles for the GMPTimeSpent component
 */

export const gmpTimeSpentStyles = {
  container:
    'flex flex-col gap-y-2 rounded-lg bg-zinc-50 px-3 py-4 dark:bg-zinc-800/25 sm:flex-row sm:justify-between sm:gap-x-2 sm:gap-y-0',
  info: {
    container: 'flex w-40 flex-col gap-y-0.5',
    numRecords:
      'whitespace-nowrap text-xs font-medium text-zinc-700 dark:text-zinc-300',
  },
  timeline: {
    container: 'flex w-full flex-col gap-y-0.5',
    points: {
      container: 'flex w-full items-center justify-between',
      point: 'flex justify-between',
      line: 'h-0.5 w-full bg-blue-600 dark:bg-blue-500',
    },
    labels: {
      container: 'ml-2 flex w-full items-center justify-between',
      label: 'flex justify-end',
      timeText:
        'whitespace-nowrap text-2xs font-medium text-zinc-900 dark:text-zinc-100',
    },
  },
} as const;

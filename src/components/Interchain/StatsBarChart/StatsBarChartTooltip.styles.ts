/**
 * Styles for the StatsBarChartTooltip component
 */

export const statsBarChartTooltipStyles = {
  container: 'flex flex-col gap-y-1.5 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800',
  item: {
    container: 'flex items-center justify-between gap-x-4',
    label: 'text-xs font-semibold capitalize',
    value: 'text-xs font-medium',
  },
} as const;


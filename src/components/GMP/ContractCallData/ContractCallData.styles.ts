export const contractCallDataStyles = {
  container: 'bg-zinc-100 dark:bg-zinc-800',
  list: 'divide-y divide-zinc-100 dark:divide-zinc-800',
  section: 'grid gap-2 px-4 py-6 sm:px-6',
  label: 'text-sm font-medium text-zinc-900 dark:text-zinc-100',
  value: 'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300',
  copyWrapper: 'min-w-min !items-start',
  copyButton: '!min-w-4',
  copyText: 'break-all text-xs',
  chainRow: 'flex items-center gap-x-2',
  chainTitle: 'text-sm font-semibold',
  statusTag: 'w-fit capitalize',
  timeSpentExpress:
    'flex items-center gap-x-1 text-green-600 dark:text-green-500',
  timeSpentTotal: 'flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500',
} as const;

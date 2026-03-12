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
  chainProfileIcon: 'h-5',
  timeSpentList: 'flex flex-col gap-y-2',
  chainLabel: 'text-xs',
  statusTag: 'w-fit capitalize',
  timeSpentExpress:
    'flex items-center gap-x-1 text-green-600 dark:text-green-500',
  timeSpentTotal: 'flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500',
} as const;

// ─── Status Tag Helper ──────────────────────────────────────────
const statusColorByState: Record<string, string> = {
  received: 'bg-green-600 dark:bg-green-500',
  approved: 'bg-orange-500 dark:bg-orange-600',
  failed: 'bg-red-600 dark:bg-red-500',
};

const DEFAULT_STATUS_COLOR = 'bg-yellow-400 dark:bg-yellow-500';

export function getStatusTagClass(status?: string): string {
  if (!status) {
    return DEFAULT_STATUS_COLOR;
  }

  return statusColorByState[status] ?? DEFAULT_STATUS_COLOR;
}

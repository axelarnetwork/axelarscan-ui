export const infoStyles = {
  container:
    'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg',
  header: 'px-4 py-6 sm:px-6',
  headerTitle:
    'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100',
  body: 'border-t border-zinc-200 dark:border-zinc-700',
  list: 'divide-y divide-zinc-100 dark:divide-zinc-800',
  section: 'px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6',
  label: 'text-sm font-medium text-zinc-900 dark:text-zinc-100',
  value:
    'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0',
  tagBase: 'w-fit capitalize',
  tokenRow: 'flex items-center gap-x-4',
  assetChip: 'h-6 w-fit rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800',
  tooltip: 'whitespace-nowrap',
  inlineNumber: 'font-medium',
  inlineNumberMuted: 'font-normal text-zinc-400 dark:text-zinc-500',
  detailsGrid: 'grid gap-4 py-4',
  detailsGridTwoCols: 'md:grid-cols-2',
  toggleContainer: 'px-4 pb-4 sm:px-6',
  toggleButton:
    'flex items-center gap-x-1 text-xs font-medium text-blue-600 dark:text-blue-500',
} as const;

// Filter button styles
export const filterButtonActive = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconActive = 'text-blue-600 dark:text-blue-500' as const;

// Main component styles
export const containerClass = 'sm:mt-8' as const;
export const headerRow = 'flex items-center justify-between gap-x-4' as const;
export const headerAuto = 'sm:flex-auto' as const;
export const headingRow = 'flex items-center space-x-2' as const;
export const evmPollsLink =
  'text-base font-medium leading-6 text-blue-600 dark:text-blue-500' as const;
export const titleSeparator = 'text-zinc-400 dark:text-zinc-500' as const;
export const pageTitle =
  'text-base font-semibold leading-6 text-zinc-900 underline dark:text-zinc-100' as const;
export const resultText =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const actionsRow = 'flex items-center gap-x-2' as const;

// Table styles
export const tableWrapper =
  '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thFirst = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thMiddle = 'px-3 py-3.5 text-left' as const;
export const thLast = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const tbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdMiddle = 'px-3 py-4 text-left' as const;
export const tdLast =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// Cell content styles
export const cellColumn = 'flex flex-col gap-y-0.5' as const;
export const pollLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const txRow = 'flex items-center gap-x-1' as const;
export const verifierTooltip = 'whitespace-nowrap' as const;
export const blockLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;

// Status tag styles
export const statusTagBase = 'w-fit capitalize' as const;
export const statusCompleted = 'bg-green-600 dark:bg-green-500' as const;
export const statusFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusExpired = 'bg-zinc-400 dark:bg-zinc-500' as const;
export const statusPending = 'bg-yellow-400 dark:bg-yellow-500' as const;
export const statusColumn = 'flex flex-col gap-y-1' as const;

// Participation styles
export const participationLink = 'flex w-fit items-center' as const;
export const voteOptionBase =
  'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase' as const;
export const voteOptionNo = 'bg-red-600 text-white dark:bg-red-500' as const;
export const voteOptionYes =
  'bg-green-600 text-white dark:bg-green-500' as const;
export const voteOptionDefault =
  'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' as const;

// Pagination
export const paginationWrapper =
  'mt-8 flex items-center justify-center' as const;

// Dynamic style helpers
export function getStatusStyle(status: string): string {
  if (status === 'completed') return statusCompleted;
  if (status === 'failed') return statusFailed;
  if (status === 'expired') return statusExpired;
  return statusPending;
}

export function getVoteOptionStyle(option: string): string {
  if (option === 'no') return voteOptionNo;
  if (option === 'yes') return voteOptionYes;
  return voteOptionDefault;
}

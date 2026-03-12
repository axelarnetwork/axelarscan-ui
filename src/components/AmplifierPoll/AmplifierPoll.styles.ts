// Info panel
export const infoPanel =
  'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoHeader = 'px-4 py-6 sm:px-6' as const;
export const infoTitle =
  'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const infoSubtitle =
  'mt-1 max-w-2xl text-sm leading-6 text-zinc-400 dark:text-zinc-500' as const;
export const txLink = 'font-semibold text-blue-600 dark:text-blue-500' as const;
export const txIdWrapper = 'flex items-center gap-x-1' as const;
export const infoBorder =
  'border-t border-zinc-200 dark:border-zinc-700' as const;
export const dlDivide =
  'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const dlRow =
  'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const dtLabel =
  'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const ddValue =
  'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;
export const blockLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const participantVotes = 'flex w-fit items-center' as const;
export const voteOptionTag =
  'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase' as const;
export const voteOptionNo = 'bg-red-600 text-white dark:bg-red-500' as const;
export const voteOptionYes =
  'bg-green-600 text-white dark:bg-green-500' as const;
export const voteOptionDefault =
  'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' as const;

// Status tag colors
export const statusCompleted = 'bg-green-600 dark:bg-green-500' as const;
export const statusFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusExpired = 'bg-zinc-400 dark:bg-zinc-500' as const;
export const statusPending = 'bg-yellow-400 dark:bg-yellow-500' as const;

export function getVoteOptionStyle(option: string): string {
  if (option === 'no') return voteOptionNo;
  if (option === 'yes') return voteOptionYes;
  return voteOptionDefault;
}

export function getStatusStyle(status: string): string {
  if (status === 'completed') return statusCompleted;
  if (status === 'failed') return statusFailed;
  if (status === 'expired') return statusExpired;
  return statusPending;
}

// Votes table
export const votesWrapper =
  '-mx-4 mt-8 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const votesTable =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const votesThead =
  'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const votesTheadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const votesThFirst = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const votesTh = 'px-3 py-3.5 text-left' as const;
export const votesThWrap = 'whitespace-nowrap px-3 py-3.5 text-left' as const;
export const votesThRight = 'px-3 py-3.5 text-right' as const;
export const votesThLast = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const votesTbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const votesRow =
  'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const votesTdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const votesTd = 'px-3 py-4 text-left' as const;
export const votesTdRight = 'px-3 py-4 text-right' as const;
export const votesTdLast =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;
export const voterLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const txHashColumn = 'flex flex-col gap-y-1' as const;
export const confirmationLink = 'flex h-6 items-center gap-x-1' as const;
export const confirmationIcon = 'text-green-600 dark:text-green-500' as const;
export const confirmationText = 'text-zinc-400 dark:text-zinc-500' as const;
export const voteTagWrapper = 'flex flex-col items-end' as const;

// Main layout
export const mainLayout = 'flex max-w-5xl flex-col gap-y-4 sm:gap-y-6' as const;

// Info panel styles
export const infoPanel =
  'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoPanelHeader = 'px-4 py-6 sm:px-6' as const;
export const infoPanelTitle =
  'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const infoPanelSubtitle =
  'mt-1 max-w-2xl text-sm leading-6 text-zinc-400 dark:text-zinc-500' as const;
export const txIdRow = 'flex items-center gap-x-1' as const;
export const txIdLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const infoBorderTop =
  'border-t border-zinc-200 dark:border-zinc-700' as const;
export const dlDivider =
  'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const dlRow =
  'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const dtLabel =
  'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const ddValue =
  'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;

// Event styles
export const eventRow = 'flex items-center gap-x-1.5' as const;
export const eventTagBase = 'w-fit' as const;
export const assetPill =
  'flex h-6 w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800' as const;
export const assetText =
  'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;

// Status tag styles
export const statusTagBase = 'w-fit capitalize' as const;
export const statusTagCompleted = 'bg-green-600 dark:bg-green-500' as const;
export const statusTagConfirmed = 'bg-orange-500 dark:bg-orange-600' as const;
export const statusTagFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusTagExpired = 'bg-zinc-400 dark:bg-zinc-500' as const;
export const statusTagPending = 'bg-yellow-400 dark:bg-yellow-500' as const;

// Link styles
export const blockLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const accountLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;

// Participation / vote option styles
export const participantsWrapper = 'flex w-fit items-center' as const;
export const voteOptionBase =
  'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase' as const;
export const voteOptionNo = 'bg-red-600 text-white dark:bg-red-500' as const;
export const voteOptionYes =
  'bg-green-600 text-white dark:bg-green-500' as const;
export const voteOptionUnsubmitted =
  'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' as const;

// Votes table styles
export const tableWrapper =
  '-mx-4 mt-8 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thFirst = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thMiddle = 'px-3 py-3.5 text-left' as const;
export const thMiddleRight =
  'whitespace-nowrap px-3 py-3.5 text-right' as const;
export const thRight = 'px-3 py-3.5 text-right' as const;
export const thLast = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const tbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdMiddle = 'px-3 py-4 text-left' as const;
export const tdMiddleRight = 'px-3 py-4 text-right' as const;
export const tdLast =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// Vote row cell styles
export const voterLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const votingPowerWrapper = 'flex flex-col items-end gap-y-1' as const;
export const votingPowerValue =
  'font-semibold text-zinc-900 dark:text-zinc-100' as const;
export const votingPowerPercent = 'text-zinc-400 dark:text-zinc-500' as const;
export const txHashWrapper = 'flex flex-col gap-y-1' as const;
export const txHashLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const statusRow = 'flex h-6 items-center gap-x-1' as const;
export const initiatedIcon = 'text-orange-500 dark:text-orange-600' as const;
export const confirmationIcon = 'text-green-600 dark:text-green-500' as const;
export const statusLabel = 'text-zinc-400 dark:text-zinc-500' as const;
export const voteWrapper = 'flex flex-col items-end' as const;

// Main component styles
export const containerClass = 'sm:mt-8' as const;
export const contentWrapper =
  'flex max-w-5xl flex-col gap-y-4 sm:gap-y-6' as const;

// --- Dynamic style helpers ---

/** Return the CSS class for a status tag based on the status string. */
export function getStatusTagStyle(status: string): string {
  switch (status) {
    case 'completed':
      return statusTagCompleted;
    case 'confirmed':
      return statusTagConfirmed;
    case 'failed':
      return statusTagFailed;
    case 'expired':
      return statusTagExpired;
    default:
      return statusTagPending;
  }
}

/** Return the CSS class for a vote option tag (used in Info). */
export function getVoteOptionStyle(option: string): string {
  switch (option) {
    case 'no':
      return voteOptionNo;
    case 'yes':
      return voteOptionYes;
    default:
      return voteOptionUnsubmitted;
  }
}

/** Return the CSS class for a vote label tag (used in Votes). */
export function getVoteStyle(vote: string): string {
  switch (vote) {
    case 'no':
      return voteOptionNo;
    case 'yes':
      return voteOptionYes;
    default:
      return voteOptionUnsubmitted;
  }
}

// Info panel
export const infoPanel =
  'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoPanelHeader = 'px-4 py-6 sm:px-6' as const;
export const infoPanelTitle =
  'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const infoPanelDescriptionWrapper = 'mt-1 flex flex-col' as const;
export const infoPanelDetails =
  'linkify max-w-xl whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400 dark:text-zinc-500' as const;
export const infoPanelWebsite =
  'text-sm text-blue-600 dark:text-blue-500' as const;
export const infoPanelBorder =
  'border-t border-zinc-200 dark:border-zinc-700' as const;
export const infoPanelDefinitionList =
  'divide-y divide-zinc-100 dark:divide-zinc-800' as const;

// Definition list rows
export const dlRow =
  'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const dlLabel =
  'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const dlValue =
  'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;

// Links
export const blueLink = 'text-blue-600 dark:text-blue-500' as const;
export const delegatorLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;

// Broadcaster
export const broadcasterWrapper = 'flex flex-col items-start gap-y-1' as const;

// Voting power
export const votingPowerRow = 'flex items-center gap-x-2' as const;
export const votingPowerValue =
  'font-medium text-zinc-900 dark:text-zinc-100' as const;
export const votingPowerPercent = 'text-zinc-400 dark:text-zinc-500' as const;

// Supported chains
export const supportedChainsGrid = 'flex flex-wrap' as const;
export const chainTooltip = 'whitespace-nowrap' as const;
export const chainImage = 'mb-1.5 mr-1.5' as const;

// Delegations table
export const delegationsWrapper = 'flex flex-col gap-y-4' as const;
export const delegationsTableScroll =
  '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const delegationsTable =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const delegationsTableHead =
  'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const delegationsTableHeadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const delegationsThFirst = 'py-2.5 pl-4 pr-3 text-left sm:pl-3' as const;
export const delegationsThMiddle = 'px-3 py-2.5 text-right' as const;
export const delegationsThLast =
  'px-3 py-2.5 pl-3 pr-4 text-right sm:pr-3' as const;
export const delegationsTableBody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const delegationsRow =
  'align-top text-xs text-zinc-400 dark:text-zinc-500' as const;
export const delegationsTdFirst = 'py-3 pl-4 pr-3 text-left sm:pl-3' as const;
export const delegationsTdMiddle = 'px-3 py-3 text-right' as const;
export const delegationsTdLast = 'py-3 pl-3 pr-4 text-right sm:pr-3' as const;
export const delegationsAmountWrapper =
  'flex items-center justify-end' as const;
export const delegationsAmountValue =
  'text-xs font-semibold text-zinc-900 dark:text-zinc-100' as const;
export const delegationsValueNumber = 'text-xs font-medium' as const;

// Uptimes / ProposedBlocks / Votes sections
export const sectionWrapper = 'my-2.5 flex flex-col gap-y-2' as const;
export const sectionHeader =
  'flex items-center justify-between gap-x-4 pr-1' as const;
export const sectionHeaderVotes = 'flex justify-between gap-x-4 pr-1' as const;
export const sectionHeaderLeft = 'flex flex-col' as const;
export const sectionTitle =
  'text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const sectionSubtitle =
  'text-xs leading-5 text-zinc-400 dark:text-zinc-500' as const;
export const sectionHeaderRight = 'flex flex-col items-end' as const;

// Block grid
export const blockGrid = 'flex flex-wrap' as const;
export const blockLink = 'h-5 w-5' as const;
export const blockDot = 'm-0.5 h-4 w-4 rounded-sm' as const;
export const blockDotActive = 'bg-green-600 dark:bg-green-500' as const;
export const blockDotInactive = 'bg-zinc-300 dark:bg-zinc-700' as const;
export const blockDotNo = 'bg-red-600 dark:bg-red-500' as const;

// Status tag colors
export const statusBonded = 'bg-green-600 dark:bg-green-500' as const;
export const statusUnbonding = 'bg-orange-500 dark:bg-orange-600' as const;
export const statusUnbonded = 'bg-red-600 dark:bg-red-500' as const;

export function getStatusStyle(status: string): string {
  if (status.includes('UN')) {
    return status.endsWith('ED') ? statusUnbonded : statusUnbonding;
  }
  return statusBonded;
}

// Balance colors
export const balanceLow = 'text-red-600 dark:text-red-500' as const;
export const balanceOk = 'text-green-600 dark:text-green-500' as const;

// Main layout
export const mainGrid =
  'grid gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-0' as const;
export const mainLeft = 'md:col-span-2' as const;
export const mainRight = 'flex flex-col gap-y-4' as const;

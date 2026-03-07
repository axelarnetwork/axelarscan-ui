// Info panel
export const infoPanel =
  'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoPanelHeader = 'px-4 py-6 sm:px-6' as const;
export const infoPanelTitle =
  'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
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
export const dlValueWithSpace =
  'mt-1 flex flex-col space-y-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;

// Status
export const statusTagActive = 'bg-green-600 dark:bg-green-500' as const;
export const statusTagInactive = 'bg-red-600 dark:bg-red-500' as const;
export const statusTagFit = 'w-fit' as const;
export const stateRow = 'flex items-center space-x-2' as const;
export const stateLabel = 'font-semibold' as const;

// Supported chains
export const supportedChainsGrid = 'flex flex-wrap' as const;
export const chainTooltip = 'whitespace-nowrap' as const;
export const chainImage = 'mb-1.5 mr-1.5' as const;

// Cumulative rewards tooltip
export const cumulativeRewardsTooltipContent = 'flex flex-col gap-y-1' as const;
export const cumulativeRewardsNumber = 'font-medium' as const;
export const cumulativeRewardsTooltipParent = '!justify-start' as const;

// Rewards table
export const rewardsWrapper = 'flex flex-col gap-y-4' as const;
export const rewardsTableScroll =
  '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const rewardsTable =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const rewardsTableHead =
  'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const rewardsTableHeadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const rewardsThFirst = 'py-2.5 pl-4 pr-3 text-left sm:pl-3' as const;
export const rewardsThMiddle = 'px-3 py-2.5 text-left' as const;
export const rewardsThRight = 'px-3 py-2.5 text-right' as const;
export const rewardsThLast =
  'whitespace-nowrap px-3 py-2.5 pl-3 pr-4 text-right sm:pr-3' as const;
export const rewardsTableBody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const rewardsRow =
  'align-top text-xs text-zinc-400 dark:text-zinc-500' as const;
export const rewardsTdFirst = 'py-3 pl-4 pr-3 text-left sm:pl-3' as const;
export const rewardsTdFirstInner = 'flex flex-col gap-y-0.5' as const;
export const rewardsTdMiddle = 'px-3 py-3' as const;
export const rewardsTdMiddleInner = 'flex items-center' as const;
export const rewardsTdRight = 'px-3 py-3 text-right' as const;
export const rewardsTdRightInner = 'flex items-center justify-end' as const;
export const rewardsTdLast = 'py-3 pl-3 pr-4 text-right sm:pr-3' as const;
export const rewardsTdLastInner = 'flex items-center justify-end' as const;

// Links
export const blueLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const numberXs = 'text-xs' as const;
export const chainFallbackText = 'text-zinc-900 dark:text-zinc-100' as const;
export const amountValue =
  'text-xs font-semibold text-zinc-900 dark:text-zinc-100' as const;

// Votes / Signs sections
export const sectionWrapper = 'my-2.5 flex flex-col gap-y-2' as const;
export const sectionHeader = 'flex justify-between gap-x-4 pr-1' as const;
export const sectionHeaderLeft = 'flex flex-col' as const;
export const sectionTitle =
  'text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const sectionSubtitle =
  'text-xs leading-5 text-zinc-400 dark:text-zinc-500' as const;
export const sectionHeaderRight = 'flex flex-col items-end' as const;

// Block grid (votes/signs)
export const blockGrid = 'flex flex-wrap' as const;
export const blockLink = 'h-5 w-5' as const;
export const blockDot = 'm-0.5 h-4 w-4 rounded-sm' as const;
export const blockDotActive = 'bg-green-600 dark:bg-green-500' as const;
export const blockDotInactive = 'bg-zinc-300 dark:bg-zinc-700' as const;
export const blockDotNo = 'bg-red-600 dark:bg-red-500' as const;

// Main layout
export const mainGrid =
  'grid gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-0' as const;
export const mainLeft = 'md:col-span-2' as const;
export const mainRight = 'flex flex-col gap-y-4' as const;

// Dot style helpers (Signs / Votes)
export function getSignDotStyle(sign: boolean | undefined): string {
  if (typeof sign !== 'boolean') return blockDotInactive;
  return sign ? blockDotActive : blockDotNo;
}

export function getVoteDotStyle(vote: boolean | undefined): string {
  if (typeof vote !== 'boolean') return blockDotInactive;
  return vote ? blockDotActive : blockDotNo;
}

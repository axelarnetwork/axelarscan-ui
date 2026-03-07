// Info panel
export const infoWrapper = 'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoHeader = 'px-4 py-6 sm:px-6' as const;
export const infoTitle = 'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const keyIdLabel = 'text-sm font-normal leading-6 text-zinc-400 dark:text-zinc-500' as const;
export const prevBatchWrapper = 'mt-3 max-w-2xl' as const;
export const prevBatchLink = 'flex items-center gap-x-1 font-medium text-blue-600 dark:text-blue-500' as const;
export const infoBorder = 'border-t border-zinc-200 dark:border-zinc-700' as const;
export const dlDivider = 'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const dlRow = 'px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6' as const;
export const dtLabel = 'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const ddValue = 'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-3 sm:mt-0' as const;

// Status
export const statusWrapper = 'flex items-center space-x-3' as const;
export const statusTagExecuted = 'w-fit capitalize bg-green-600 dark:bg-green-500' as const;
export const statusTagSigned = 'w-fit capitalize bg-orange-500 dark:bg-orange-600' as const;
export const statusTagSigning = 'w-fit capitalize bg-yellow-400 dark:bg-yellow-500' as const;
export const statusTagDefault = 'w-fit capitalize bg-red-600 dark:bg-red-500' as const;

// Commands table
export const tableScrollWrapper = '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table = 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const tableHead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const tableHeadRow = 'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thFirst = 'py-2.5 pl-4 pr-3 text-left sm:pl-3' as const;
export const thMiddle = 'px-3 py-2.5 text-left' as const;
export const thLast = 'px-3 py-2.5 pl-3 pr-4 text-left sm:pr-3' as const;
export const tableBody = 'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tableRow = 'align-top text-xs text-zinc-400 dark:text-zinc-500' as const;
export const tdFirst = 'py-3 pl-4 pr-3 text-left sm:pl-3' as const;
export const tdMiddle = 'px-3 py-3 text-left' as const;
export const tdLast = 'py-3 pl-3 pr-4 text-left sm:pr-3' as const;

// Command elements
export const commandIdText = 'font-medium' as const;
export const commandTypeWrapper = 'flex' as const;
export const commandTagExecuted = 'w-fit text-2xs capitalize bg-green-600 dark:bg-green-500' as const;
export const commandTagUnexecuted = 'w-fit text-2xs capitalize bg-orange-500 dark:bg-orange-600' as const;
export const linkBlue = 'text-blue-600 dark:text-blue-500' as const;
export const linkBlueMedium = 'font-medium text-blue-600 dark:text-blue-500' as const;

// Parameters cell
export const paramsWrapper = 'flex lg:flex-wrap lg:items-center' as const;
export const assetBadge = 'mr-2 flex h-6 min-w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800' as const;
export const assetText = 'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const sourceChainWrapper = 'mr-2 flex h-6 min-w-fit items-center gap-x-1.5' as const;
export const tooltipNoWrap = 'whitespace-nowrap' as const;
export const codeIcon = 'text-zinc-700 dark:text-zinc-300' as const;
export const mintTransferWrapper = 'mr-2 flex h-6 min-w-fit items-center gap-x-1.5' as const;
export const saltWrapper = 'mr-2 flex h-6 items-center gap-x-1.5' as const;
export const saltLabel = 'text-zinc-400 dark:text-zinc-500' as const;
export const nameWrapper = 'mr-2 flex flex-col' as const;
export const nameText = 'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const nameDetailsRow = 'flex items-center gap-x-2' as const;
export const nameDetail = 'text-xs text-zinc-400 dark:text-zinc-500' as const;
export const ownersBadge = 'mr-2 h-6 rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' as const;
export const operatorsWrapper = 'mr-2 flex items-center' as const;
export const operatorsBadge = 'mr-2 h-6 rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' as const;
export const weightsText = 'text-xs font-medium text-zinc-700 dark:text-zinc-300' as const;
export const thresholdText = 'mr-2 text-xs font-medium' as const;

// Execute data / Data / Signatures
export const dataWrapper = 'flex items-start gap-x-2' as const;
export const dataTag = 'break-all bg-white px-3 py-3 font-sans text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500' as const;
export const dataCopy = 'mt-3' as const;
export const signaturesGrid = 'grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4' as const;
export const signatureText = 'text-xs text-zinc-400 dark:text-zinc-500' as const;

// EVMBatch main
export const contentWrapper = 'max-w-5xl' as const;

// Execute button
export const executeButtonWrapper = 'flex items-center gap-x-2' as const;
export const executeButtonBase = 'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white' as const;
export const executeButtonDisabled = 'pointer-events-none bg-blue-400 dark:bg-blue-400' as const;
export const executeButtonEnabled = 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600' as const;

// Toast
export const toastWrapper = 'flex flex-col gap-y-1 rounded-lg bg-white px-3 py-2.5 shadow-lg sm:gap-y-0' as const;
export const toastRow = 'flex items-center gap-x-1.5 sm:gap-x-2' as const;
export const toastMessage = 'text-zinc-700' as const;
export const toastLinkRow = 'ml-6 flex items-center justify-between gap-x-4 pl-0.5 sm:ml-7 sm:pl-0' as const;
export const toastExplorerLink = 'text-zinc-700 text-xs sm:text-sm' as const;
export const toastDismiss = 'text-xs font-light text-zinc-400 underline sm:text-sm' as const;
export const toastIconSuccess = 'text-green-600' as const;
export const toastIconFailed = 'text-red-600' as const;

// Info section styles
export const infoCard = 'overflow-auto bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoHeaderWrapper = 'px-4 py-6 sm:px-6' as const;
export const infoHeading = 'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const listboxWrapper = 'w-56' as const;
export const listboxRelative = 'relative' as const;
export const listboxButton = 'relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm dark:border-zinc-800 dark:text-zinc-100 sm:text-sm sm:leading-6' as const;
export const listboxButtonText = 'block truncate' as const;
export const listboxButtonIcon = 'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2' as const;
export const listboxChevronIcon = 'text-zinc-400' as const;
export const listboxOptions = 'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm' as const;
export const listboxOptionBase = 'relative cursor-default select-none py-2 pl-3 pr-9' as const;
export const listboxOptionActive = 'bg-blue-600 text-white' as const;
export const listboxOptionInactive = 'text-zinc-900' as const;
export const listboxOptionTextSelected = 'font-semibold' as const;
export const listboxOptionTextNormal = 'font-normal' as const;
export const listboxCheckActive = 'text-white' as const;
export const listboxCheckInactive = 'text-blue-600' as const;
export const listboxCheckWrapper = 'absolute inset-y-0 right-0 flex items-center pr-4' as const;

// Info body styles
export const infoBorderTop = 'border-t border-zinc-200 dark:border-zinc-700' as const;
export const infoGrid = 'grid gap-y-4 sm:grid-cols-2' as const;
export const infoDl = 'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const infoRow = 'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const infoDt = 'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const infoDd = 'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;

// Info contracts table styles
export const contractsCard = 'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const contractsTable = 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const contractsThead = 'sticky top-0 z-10' as const;
export const contractsTheadRow = 'text-base font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const contractsTh = 'px-4 py-6 text-left sm:px-6' as const;
export const contractsTbody = 'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const contractsTr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const contractsTdLabel = 'px-4 py-6 text-left sm:px-6' as const;
export const contractsTdLabelText = 'font-medium text-zinc-900 dark:text-zinc-100' as const;
export const contractsTd = 'px-4 py-6 text-left sm:px-6' as const;
export const contractsTdContent = 'text-sm text-zinc-800 dark:text-zinc-200' as const;
export const addressFlexCol = 'flex flex-col gap-y-4' as const;
export const addressRow = 'inline-flex items-center space-x-2' as const;
export const tooltipContent = 'whitespace-nowrap text-xs' as const;

// Filter button styles
export const filterButtonActive = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconActive = 'text-blue-600 dark:text-blue-500' as const;

// Main component styles
export const containerClass = 'sm:mt-8' as const;
export const mainWrapper = 'flex flex-col gap-y-12' as const;
export const sectionWrapper = 'flex flex-col gap-y-4' as const;
export const headerRow = 'flex items-center justify-between gap-x-4' as const;
export const headerAuto = 'sm:flex-auto' as const;
export const pageTitle = 'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const sectionTitle = 'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const resultText = 'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const actionsRow = 'flex items-center gap-x-2' as const;

// Table styles
export const tableWrapper = '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table = 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadRow = 'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thFirst = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thTxHash = 'whitespace-nowrap px-3 py-3.5 text-left' as const;
export const thMiddle = 'px-3 py-3.5 text-left' as const;
export const thPayoutRight = 'px-3 py-3.5 text-right' as const;
export const thLast = 'whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const tbody = 'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdMiddle = 'px-3 py-4 text-left' as const;
export const tdLast = 'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// Data cell styles
export const blockLink = 'font-medium text-blue-600 dark:text-blue-500' as const;
export const txLink = 'font-semibold text-blue-600 dark:text-blue-500' as const;
export const poolTag = 'w-fit bg-green-600 capitalize text-white dark:bg-green-500' as const;
export const recipientsWrapper = 'flex flex-col gap-y-2' as const;
export const recipientToggle = 'flex cursor-pointer items-center gap-x-1' as const;
export const recipientCount = 'font-medium text-zinc-900 dark:text-zinc-100' as const;
export const recipientGrid = 'grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-3' as const;
export const recipientRow = 'flex items-center justify-between gap-x-2' as const;
export const recipientProfileClass = 'text-xs' as const;
export const recipientAmount = 'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const payoutWrapper = 'flex items-center justify-end' as const;
export const payoutAmount = 'font-semibold text-zinc-900 dark:text-zinc-100' as const;
export const paginationWrapper = 'mt-8 flex items-center justify-center' as const;

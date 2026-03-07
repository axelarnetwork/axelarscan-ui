// Transfer component styles
// All Tailwind class strings extracted from Transfer.jsx

// ─── Info Section ──────────────────────────────────────────────
export const infoWrapper = 'overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const infoHeaderPadding = 'px-4 py-6 sm:px-6' as const;
export const infoTitle = 'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const infoSubtitle = 'mt-1 max-w-2xl text-sm leading-6 text-zinc-400 dark:text-zinc-500' as const;
export const infoTxHashRow = 'flex items-center gap-x-1' as const;
export const infoTxHashLink = 'font-semibold text-blue-600 dark:text-blue-500' as const;

// ─── Info Body / Definition List ───────────────────────────────
export const infoBorderTop = 'border-t border-zinc-200 dark:border-zinc-700' as const;
export const infoDl = 'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const infoRow = 'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const infoDt = 'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const infoDd = 'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;

// ─── Status / Steps ────────────────────────────────────────────
export const statusFlexCol = 'flex flex-col gap-y-1.5' as const;
export const statusNav = 'h-16 overflow-x-auto sm:h-12' as const;
export const statusOl = 'flex items-center' as const;
export const stepCircleBase = 'relative flex h-8 w-8 items-center justify-center rounded-full' as const;
export const stepCircleFailed = 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400' as const;
export const stepCircleSuccess = 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400' as const;
export const stepIcon = 'h-5 w-5 text-white' as const;
export const stepLabelFailed = 'text-red-600 dark:text-red-500' as const;
export const stepLabelSuccess = 'text-blue-600 dark:text-blue-500' as const;
export const stepLabelBase = 'absolute mt-1 whitespace-nowrap text-2xs font-medium' as const;
export const stepLiNotLast = 'pr-16 sm:pr-24' as const;
export const stepLiBase = 'relative' as const;
export const stepPendingInset = 'absolute inset-0 flex items-center' as const;
export const stepPendingBar = 'h-0.5 w-full bg-zinc-200 dark:bg-zinc-700' as const;
export const stepPendingCircleBase = 'relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-zinc-50 dark:bg-zinc-800' as const;
export const stepPendingBorderInactive = 'border-zinc-200 dark:border-zinc-700' as const;
export const stepPendingBorderActive = 'border-blue-600 dark:border-blue-500' as const;
export const stepPendingClockActive = 'text-blue-600 dark:text-blue-500' as const;
export const stepPendingClockInactive = 'text-zinc-200 dark:text-zinc-700' as const;
export const stepPendingLabelBase = 'absolute mt-12 whitespace-nowrap pt-1 text-2xs font-medium' as const;
export const stepPendingLabelActive = 'text-blue-600 dark:text-blue-500' as const;
export const stepPendingLabelInactive = 'text-zinc-400 dark:text-zinc-500' as const;
export const stepCompletedBarFailed = 'bg-red-600 dark:bg-red-500' as const;
export const stepCompletedBarSuccess = 'bg-blue-600 dark:bg-blue-500' as const;
export const stepCompletedBarBase = 'h-0.5 w-full' as const;

// ─── Insufficient Fee ──────────────────────────────────────────
export const insufficientFeeRow = 'flex items-center gap-x-1 text-red-600 dark:text-red-500' as const;
export const insufficientFeeText = 'text-xs' as const;

// ─── Asset ─────────────────────────────────────────────────────
export const assetRow = 'flex min-w-max items-center gap-x-2' as const;
export const assetValue = 'font-medium text-zinc-900 dark:text-zinc-100' as const;

// ─── Tag ───────────────────────────────────────────────────────
export const tagFitCapitalize = 'w-fit capitalize' as const;

// ─── Short label offset ────────────────────────────────────────
export const shortLabelOffset = 'ml-1' as const;

// ─── Details Table ─────────────────────────────────────────────
export const detailsTableWrapper = '-mx-4 mt-8 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const detailsTable = 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const detailsThead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const detailsTheadTr = 'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const detailsThStep = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const detailsThTxHash = 'whitespace-nowrap px-3 py-3.5 text-left' as const;
export const detailsThDefault = 'px-3 py-3.5 text-left' as const;
export const detailsThTime = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const detailsTbody = 'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const detailsTr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const detailsTdStep = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const detailsTdStepText = 'font-medium text-zinc-700 dark:text-zinc-300' as const;
export const detailsTdDefault = 'px-3 py-4 text-left' as const;
export const detailsTdTime = 'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;
export const detailsTxFlexCol = 'flex flex-col gap-y-2' as const;
export const detailsTxRow = 'flex items-center gap-x-1' as const;
export const detailsTxLink = 'font-medium text-blue-600 dark:text-blue-500' as const;
export const detailsMoreInfos = 'flex items-center gap-x-3' as const;
export const detailsBatchLink = 'text-xs text-blue-600 underline dark:text-blue-500' as const;
export const detailsAckLink = 'text-xs text-blue-600 underline dark:text-blue-500' as const;
export const detailsIbcFailedLink = 'whitespace-nowrap text-xs text-red-600 underline dark:text-red-500' as const;
export const detailsIbcSendLink = 'whitespace-nowrap text-xs text-blue-600 underline dark:text-blue-500' as const;

// ─── Details Status Tag ────────────────────────────────────────
export const detailsTagSuccess = 'bg-green-600 dark:bg-green-500' as const;
export const detailsTagFailed = 'bg-red-600 dark:bg-red-500' as const;

// ─── Transfer (main) ───────────────────────────────────────────
export const transferContainer = 'sm:mt-8' as const;
export const transferContent = 'flex max-w-5xl flex-col gap-y-4' as const;

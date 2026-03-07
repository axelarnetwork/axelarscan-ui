// Transfers component styles
// All Tailwind class strings extracted from Transfers.jsx

// ─── Filter Button ─────────────────────────────────────────────
export const filterBtnFiltered = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconFiltered = 'text-blue-600 dark:text-blue-500' as const;

// ─── Deprecation Banner ────────────────────────────────────────
export const deprecationBanner =
  'mb-4 flex items-center gap-x-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' as const;
export const deprecationBannerText = 'text-sm' as const;

// ─── Transfers Layout ──────────────────────────────────────────
export const transfersContainer = 'sm:mt-8' as const;
export const transfersHeaderRow =
  'flex items-center justify-between gap-x-4' as const;
export const transfersHeaderLeft = 'sm:flex-auto' as const;
export const transfersTitle =
  'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const transfersSubtitle =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const transfersActions = 'flex items-center gap-x-2' as const;

// ─── Transfers Table ───────────────────────────────────────────
export const tableWrapper =
  '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadTr =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thTxHash =
  'whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'px-3 py-3.5 text-left' as const;
export const thCreatedAt =
  'whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const tbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;

// ─── Transfers Table Row ───────────────────────────────────────
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdTxHash = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdTxHashRow = 'flex items-center gap-x-1' as const;
export const tdTxHashLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdCreatedAt =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Method Column ─────────────────────────────────────────────
export const methodCol = 'flex flex-col gap-y-1.5' as const;
export const tagFitCapitalize = 'w-fit capitalize' as const;
export const assetBadge =
  'flex h-6 w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800' as const;
export const assetNumberText =
  'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const assetSymbolText =
  'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;

// ─── Source / Destination Column ───────────────────────────────
export const chainCol = 'flex flex-col gap-y-1' as const;

// ─── Status Column ─────────────────────────────────────────────
export const statusCol = 'flex flex-col gap-y-1.5' as const;
export const statusRow = 'flex items-center space-x-1.5' as const;
export const statusTagReceived = 'bg-green-600 dark:bg-green-500' as const;
export const statusTagApproved = 'bg-orange-500 dark:bg-orange-600' as const;
export const statusTagFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusTagDefault = 'bg-yellow-400 dark:bg-yellow-500' as const;
export const insufficientFeeRow =
  'flex items-center gap-x-1 text-red-600 dark:text-red-500' as const;
export const insufficientFeeText = 'text-xs' as const;
export const timeSpentRow =
  'flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500' as const;
export const timeSpentText = 'text-xs' as const;

// ─── Pagination ────────────────────────────────────────────────
export const paginationWrapper =
  'mt-8 flex items-center justify-center' as const;

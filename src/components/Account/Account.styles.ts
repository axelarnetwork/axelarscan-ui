// Account component styles
// All Tailwind class strings extracted from the component

// ─── Card Container ─────────────────────────────────────────────
export const card =
  'h-fit overflow-hidden bg-zinc-50/75 shadow dark:bg-zinc-800/25 sm:rounded-lg' as const;
export const cardHeader = 'px-4 py-6 sm:px-6' as const;
export const cardTitle =
  'text-base font-semibold leading-7 text-zinc-900 dark:text-zinc-100' as const;
export const cardBorder =
  'border-t border-zinc-200 dark:border-zinc-700' as const;
export const cardDivider =
  'divide-y divide-zinc-100 dark:divide-zinc-800' as const;

// ─── Detail Row ─────────────────────────────────────────────────
export const detailRow =
  'px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6' as const;
export const detailLabel =
  'text-sm font-medium text-zinc-900 dark:text-zinc-100' as const;
export const detailValue =
  'mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:col-span-2 sm:mt-0' as const;
export const detailValueCol = 'flex flex-col' as const;
export const detailValueRow = 'flex items-center' as const;

// ─── Transfer Link ──────────────────────────────────────────────
export const transferLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;

// ─── Number Display ─────────────────────────────────────────────
export const numberValue =
  'font-medium text-zinc-700 dark:text-zinc-300' as const;

// ─── Balances Section ───────────────────────────────────────────
export const balancesContainer =
  'flex flex-col bg-zinc-50/75 px-4 pb-6 pt-3 shadow dark:bg-zinc-800/25 sm:rounded-lg sm:px-6' as const;
export const tableScrollContainer =
  '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const sectionTitle = 'text-sm font-semibold' as const;

// ─── Table ──────────────────────────────────────────────────────
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const tableHead = 'sticky top-0 z-10' as const;
export const tableHeadDelegations =
  'sticky top-0 z-10 bg-zinc-50/75 dark:bg-zinc-800/25' as const;
export const tableHeadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const tableBody =
  'divide-y divide-zinc-100 dark:divide-zinc-800' as const;
export const tableRow =
  'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;

// ─── Table Header Cells ─────────────────────────────────────────
export const thFirst = 'py-2 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'px-3 py-2 text-left' as const;
export const thRight = 'px-3 py-2 text-right' as const;
export const thLast = 'py-2 pl-3 pr-4 text-right sm:pr-0' as const;
export const thUnstakingsAvailable =
  'whitespace-nowrap py-2 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Table Data Cells ───────────────────────────────────────────
export const tdIndex = 'py-4 pl-4 pr-3 text-left text-xs sm:pl-0' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdRight = 'px-3 py-4 text-right' as const;
export const tdLast = 'py-4 pl-3 pr-4 text-right sm:pr-0' as const;
export const tdUnstakingsTime =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Balance Row Content ────────────────────────────────────────
export const assetCell = 'flex w-fit items-center gap-x-2' as const;
export const assetInfo = 'flex items-center gap-x-2' as const;
export const assetNameWrapper = 'flex items-center gap-x-1' as const;
export const assetName =
  'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const assetPrice =
  'text-xs text-zinc-400 dark:text-zinc-500' as const;
export const balanceValue =
  'text-xs font-semibold text-zinc-900 dark:text-zinc-100' as const;
export const cellEndAligned = 'flex items-center justify-end' as const;
export const balanceUsdValue = 'text-xs font-medium' as const;

// ─── Delegations Tabs ───────────────────────────────────────────
export const tabNav = 'flex gap-x-4' as const;
export const tabActive =
  'text-sm capitalize font-semibold text-zinc-900 underline dark:text-zinc-100' as const;
export const tabInactive =
  'text-sm capitalize font-medium text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300' as const;

// ─── Delegation Row Content ─────────────────────────────────────
export const delegationValidatorCell =
  'flex items-center gap-x-1.5' as const;
export const redelegationArrow =
  'text-zinc-700 dark:text-zinc-300' as const;

// ─── Pagination ─────────────────────────────────────────────────
export const paginationWrapper =
  'mt-4 flex items-center justify-center' as const;

// ─── Main Account Layout ────────────────────────────────────────
export const mainGrid =
  'grid gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-12' as const;
export const transactionsCol = 'overflow-x-auto sm:col-span-3' as const;

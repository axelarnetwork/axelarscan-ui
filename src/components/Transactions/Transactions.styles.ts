// Transactions component styles
// All Tailwind class strings extracted from the component

// ─── Filter Button ───────────────────────────────────────────────
export const filterButtonActive = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconActive = 'text-blue-600 dark:text-blue-500' as const;

// ─── Main Layout ────────────────────────────────────────────────
export const containerHeight = 'mx-0 mt-5 pt-0.5' as const;
export const containerAddress = 'max-w-full' as const;
export const containerDefault = 'sm:mt-8' as const;

export const headerRow = 'flex items-center justify-between gap-x-4' as const;
export const headerLeft = 'sm:flex-auto' as const;
export const headerTitle =
  'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const headerSubtitle =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const headerActions = 'flex items-center gap-x-2' as const;

// ─── Table ──────────────────────────────────────────────────────
export const tableScrollContainer =
  '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const tableScrollContainerNoMargin = 'mt-0' as const;
export const tableScrollContainerMargin = 'mt-4' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const tableHead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const tableHeadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const tableBody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const tableRow =
  'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;

// ─── Table Header Cells ─────────────────────────────────────────
export const thFirst =
  'whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'px-3 py-3.5 text-left' as const;
export const thRight = 'px-3 py-3.5 text-right' as const;
export const thLast = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Table Data Cells ───────────────────────────────────────────
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdRight = 'px-3 py-4 text-right' as const;
export const tdLast =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;

// ─── Table Cell Content ─────────────────────────────────────────
export const cellFlexCol = 'flex flex-col gap-y-0.5' as const;
export const txHashLink =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const heightLink =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const typeTag =
  'w-fit bg-zinc-100 capitalize text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' as const;
export const statusTagBase = 'w-fit capitalize' as const;
export const statusFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusSuccess = 'bg-green-600 dark:bg-green-500' as const;
export const feeNumber =
  'text-xs font-medium text-zinc-700 dark:text-zinc-300' as const;

// ─── Pagination ─────────────────────────────────────────────────
export const paginationWrapper =
  'mt-8 flex items-center justify-center' as const;

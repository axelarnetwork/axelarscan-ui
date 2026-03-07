// Transactions component styles
// All Tailwind class strings extracted from the component

// ─── Filter Button ───────────────────────────────────────────────
export const filterButtonActive = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconActive = 'text-blue-600 dark:text-blue-500' as const;

// ─── Filter Dialog ───────────────────────────────────────────────
export const dialogContainer = 'relative z-50' as const;
export const dialogBackdrop =
  'fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50' as const;
export const dialogOuterWrapper = 'fixed inset-0 overflow-hidden' as const;
export const dialogInnerWrapper = 'absolute inset-0 overflow-hidden' as const;
export const dialogPanelContainer =
  'pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16' as const;
export const dialogPanel = 'pointer-events-auto w-screen max-w-md' as const;
export const dialogForm =
  'flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl' as const;
export const dialogScrollArea = 'h-0 flex-1 overflow-y-auto' as const;
export const dialogHeader =
  'flex items-center justify-between bg-blue-600 p-4 sm:px-6' as const;
export const dialogTitle =
  'text-base font-semibold leading-6 text-white' as const;
export const dialogCloseButton =
  'relative ml-3 text-blue-200 hover:text-white' as const;
export const dialogBody =
  'flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6' as const;

// ─── Filter Transitions ─────────────────────────────────────────
export const transitionEnter =
  'transform transition ease-in-out duration-500 sm:duration-700' as const;
export const transitionLeave =
  'transition ease-in duration-100' as const;

// ─── Filter Form Fields ─────────────────────────────────────────
export const fieldLabel =
  'text-sm font-medium leading-6 text-zinc-900' as const;
export const fieldWrapper = 'mt-2' as const;

// ─── Select / Combobox ──────────────────────────────────────────
export const selectRelative = 'relative' as const;
export const selectButton =
  'relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6' as const;
export const selectMultipleWrap = 'flex flex-wrap' as const;
export const selectMultipleWrapActive = 'my-1' as const;
export const selectTruncate = 'block truncate' as const;
export const selectChevronWrapper =
  'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2' as const;
export const selectChevronIcon = 'text-zinc-400' as const;
export const selectMultipleTag =
  'my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900' as const;
export const selectSearchWrapper = 'mt-2 gap-y-2' as const;
export const selectSearchInput =
  'w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6' as const;
export const selectDropdown =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm' as const;
export const selectOptionBase =
  'relative cursor-default select-none py-2 pl-3 pr-9' as const;
export const selectOptionActive = 'bg-blue-600 text-white' as const;
export const selectOptionInactive = 'text-zinc-900' as const;
export const selectOptionTextSelected = 'font-semibold' as const;
export const selectOptionTextNormal = 'font-normal' as const;
export const selectCheckWrapper =
  'absolute inset-y-0 right-0 flex items-center pr-4' as const;
export const selectCheckActive = 'text-white' as const;
export const selectCheckInactive = 'text-blue-600' as const;

// ─── Text Input ─────────────────────────────────────────────────
export const textInput =
  'w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6' as const;

// ─── Filter Footer Buttons ──────────────────────────────────────
export const filterFooter = 'flex flex-shrink-0 justify-end p-4' as const;
export const resetButton =
  'rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50' as const;
export const submitButtonBase =
  'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' as const;
export const submitButtonEnabled = 'bg-blue-600 hover:bg-blue-500' as const;
export const submitButtonDisabled =
  'cursor-not-allowed bg-blue-500' as const;

// ─── Main Layout ────────────────────────────────────────────────
export const containerHeight = 'mx-0 mt-5 pt-0.5' as const;
export const containerAddress = 'max-w-full' as const;
export const containerDefault = 'sm:mt-8' as const;

export const headerRow =
  'flex items-center justify-between gap-x-4' as const;
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
export const tableHead =
  'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
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

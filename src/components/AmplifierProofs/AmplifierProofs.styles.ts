// AmplifierProofs component styles
// All Tailwind class strings extracted from AmplifierProofs.jsx

// ─── Filter Button ─────────────────────────────────────────────
export const filterBtnFiltered = 'bg-blue-50 dark:bg-blue-950' as const;
export const filterIconFiltered = 'text-blue-600 dark:text-blue-500' as const;

// ─── Filter Dialog ─────────────────────────────────────────────
export const filterDialogRoot = 'relative z-50' as const;
export const filterBackdrop =
  'fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50' as const;
export const filterOverflowOuter = 'fixed inset-0 overflow-hidden' as const;
export const filterOverflowInner = 'absolute inset-0 overflow-hidden' as const;
export const filterPanelPositioner =
  'pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16' as const;
export const filterPanel = 'pointer-events-auto w-screen max-w-md' as const;
export const filterForm =
  'flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl' as const;
export const filterFormScrollArea = 'h-0 flex-1 overflow-y-auto' as const;
export const filterHeader =
  'flex items-center justify-between bg-blue-600 p-4 sm:px-6' as const;
export const filterHeaderTitle =
  'text-base font-semibold leading-6 text-white' as const;
export const filterCloseBtn =
  'relative ml-3 text-blue-200 hover:text-white' as const;
export const filterAttributesList =
  'flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6' as const;
export const filterLabel =
  'text-sm font-medium leading-6 text-zinc-900' as const;
export const filterFieldWrapper = 'mt-2' as const;

// ─── Filter Select (Combobox / Listbox) ────────────────────────
export const selectButton =
  'relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6' as const;
export const selectFlexWrap = 'flex flex-wrap' as const;
export const selectFlexWrapMargin = 'my-1' as const;
export const selectTruncate = 'block truncate' as const;
export const selectChevronWrapper =
  'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2' as const;
export const selectChevronIcon = 'text-zinc-400' as const;
export const selectMultiTag =
  'my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900' as const;

// ─── Filter Combobox Dropdown ──────────────────────────────────
export const comboboxDropdownWrapper = 'mt-2 gap-y-2' as const;
export const comboboxInput =
  'w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6' as const;
export const comboboxOptions =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm' as const;
export const comboboxOptionBase =
  'relative cursor-default select-none py-2 pl-3 pr-9' as const;
export const comboboxOptionActive = 'bg-blue-600 text-white' as const;
export const comboboxOptionInactive = 'text-zinc-900' as const;
export const optionTextSelected = 'font-semibold' as const;
export const optionTextNormal = 'font-normal' as const;
export const optionCheckWrapper =
  'absolute inset-y-0 right-0 flex items-center pr-4' as const;
export const optionCheckActive = 'text-white' as const;
export const optionCheckInactive = 'text-blue-600' as const;

// ─── Filter Listbox Dropdown ───────────────────────────────────
export const listboxOptions =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm' as const;

// ─── Filter Text Input ─────────────────────────────────────────
export const textInput =
  'w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6' as const;

// ─── Filter Footer Buttons ─────────────────────────────────────
export const filterFooter = 'flex flex-shrink-0 justify-end p-4' as const;
export const resetBtn =
  'rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50' as const;
export const submitBtnBase =
  'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' as const;
export const submitBtnEnabled = 'bg-blue-600 hover:bg-blue-500' as const;
export const submitBtnDisabled = 'cursor-not-allowed bg-blue-500' as const;

// ─── AmplifierProofs Layout ────────────────────────────────────
export const proofsContainer = 'sm:mt-8' as const;
export const proofsHeaderRow =
  'flex items-center justify-between gap-x-4' as const;
export const proofsHeaderLeft = 'sm:flex-auto' as const;
export const proofsNavLinks = 'flex items-center space-x-2' as const;
export const evmBatchesLink =
  'text-base font-medium leading-6 text-blue-600 dark:text-blue-500' as const;
export const navDivider = 'text-zinc-400 dark:text-zinc-500' as const;
export const proofsTitle =
  'text-base font-semibold leading-6 text-zinc-900 underline dark:text-zinc-100' as const;
export const proofsSubtitle =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;
export const proofsActions = 'flex items-center gap-x-2' as const;

// ─── AmplifierProofs Table ─────────────────────────────────────
export const tableWrapper =
  '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadTr =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thSessionId =
  'whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thDefault = 'px-3 py-3.5 text-left' as const;
export const thTime = 'py-3.5 pl-3 pr-4 text-right sm:pr-0' as const;
export const tbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;

// ─── Table Row ─────────────────────────────────────────────────
export const tr = 'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdSessionId = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdDefault = 'px-3 py-4 text-left' as const;
export const tdTime =
  'flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0' as const;
export const flexColGapSmall = 'flex flex-col gap-y-0.5' as const;
export const flexColGap1 = 'flex flex-col gap-y-1' as const;
export const flexItemsGap1 = 'flex items-center gap-x-1' as const;
export const flexItemsGap4 = 'flex items-center gap-x-4' as const;
export const flexItems = 'flex items-center' as const;
export const tooltipWhitespace = 'whitespace-nowrap' as const;

// ─── Links ─────────────────────────────────────────────────────
export const linkBlue =
  'font-semibold text-blue-600 dark:text-blue-500' as const;
export const linkBlueMedium =
  'font-medium text-blue-600 dark:text-blue-500' as const;
export const linkFitItems = 'flex w-fit items-center' as const;

// ─── Status Tag ────────────────────────────────────────────────
export const statusTagBase = 'w-fit capitalize' as const;
export const statusCompleted = 'bg-green-600 dark:bg-green-500' as const;
export const statusFailed = 'bg-red-600 dark:bg-red-500' as const;
export const statusExpired = 'bg-zinc-400 dark:bg-zinc-500' as const;
export const statusPending = 'bg-yellow-400 dark:bg-yellow-500' as const;

// ─── Sign Options ──────────────────────────────────────────────
export const signOptionBase =
  'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase' as const;
export const signOptionSigned =
  'bg-green-600 text-white dark:bg-green-500' as const;
export const signOptionOther =
  'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' as const;

// ─── Pagination ────────────────────────────────────────────────
export const paginationWrapper =
  'mt-8 flex items-center justify-center' as const;

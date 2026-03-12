// ---- Filter Dialog ----
export const dialogWrapper = 'relative z-50' as const;
export const dialogBackdrop =
  'fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50' as const;
export const dialogOverflowWrapper = 'fixed inset-0 overflow-hidden' as const;
export const dialogAbsoluteOverflow =
  'absolute inset-0 overflow-hidden' as const;
export const dialogPointerWrapper =
  'pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16' as const;
export const dialogPanel = 'pointer-events-auto w-screen max-w-md' as const;
export const dialogForm =
  'flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl dark:divide-zinc-700 dark:bg-zinc-900' as const;
export const dialogScrollArea = 'h-0 flex-1 overflow-y-auto' as const;
export const dialogHeader =
  'flex items-center justify-between bg-blue-600 p-4 sm:px-6' as const;
export const dialogTitle =
  'text-base font-semibold leading-6 text-white' as const;
export const dialogCloseButton =
  'relative ml-3 text-blue-200 hover:text-white' as const;
export const dialogBody =
  'flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6' as const;

// ---- Filter field chrome ----
export const filterLabel =
  'text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100' as const;
export const filterFieldWrapper = 'mt-2' as const;

// ---- Text / search input ----
export const filterInput =
  'w-full rounded-md border border-zinc-200 bg-white py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:text-sm sm:leading-6' as const;

// ---- Select button (shared by Combobox & Listbox) ----
export const selectButton =
  'relative w-full cursor-pointer rounded-md border border-zinc-200 bg-white py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm sm:leading-6' as const;
export const selectRelative = 'relative' as const;
export const selectTruncate = 'block truncate' as const;
export const selectIconWrapper =
  'pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2' as const;
export const selectChevronIcon = 'text-zinc-400' as const;

// ---- Multi-select button content ----
export const selectMultiWrapBase = 'flex flex-wrap' as const;
export const selectMultiWrapSelected = 'my-1' as const;
export const selectTag =
  'my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100' as const;

// ---- Combobox dropdown ----
export const selectSearchWrapper = 'mt-2 gap-y-2' as const;

// ---- Options list (Combobox & Listbox) ----
export const selectOptions =
  'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg dark:bg-zinc-800 sm:text-sm' as const;
export const selectOptionBase =
  'relative cursor-default select-none py-2 pl-3 pr-9' as const;
export const selectOptionActive = 'bg-blue-600 text-white' as const;
export const selectOptionInactive = 'text-zinc-900 dark:text-zinc-100' as const;

// ---- Option text & check icon ----
export const selectOptionTextSelected = 'font-semibold' as const;
export const selectOptionTextNormal = 'font-normal' as const;
export const selectCheckWrapper =
  'absolute inset-y-0 right-0 flex items-center pr-4' as const;
export const selectCheckActive = 'text-white' as const;
export const selectCheckInactive = 'text-blue-600' as const;

// ---- Footer action buttons ----
export const filterActionsWrapper =
  'flex flex-shrink-0 justify-end p-4' as const;
export const resetButton =
  'rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700' as const;
export const submitButtonBase =
  'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' as const;
export const submitButtonEnabled = 'bg-blue-600 hover:bg-blue-500' as const;
export const submitButtonDisabled = 'cursor-not-allowed bg-blue-500' as const;

// Header
export const headerWrapper =
  'flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0' as const;
export const navLinks = 'flex items-center space-x-2' as const;
export const validatorsLink =
  'text-base font-medium leading-6 text-blue-600 dark:text-blue-500' as const;
export const navDivider = 'text-zinc-400 dark:text-zinc-500' as const;
export const pageTitle =
  'text-base font-semibold leading-6 text-zinc-900 underline dark:text-zinc-100' as const;
export const pageDescription =
  'mt-2 text-sm text-zinc-400 dark:text-zinc-500' as const;

// Table
export const tableWrapper =
  '-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible' as const;
export const table =
  'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700' as const;
export const thead = 'sticky top-0 z-10 bg-white dark:bg-zinc-900' as const;
export const theadRow =
  'text-sm font-semibold text-zinc-800 dark:text-zinc-200' as const;
export const thFirst = 'py-3.5 pl-4 pr-3 text-left sm:pl-0' as const;
export const thMiddle = 'px-3 py-3.5 text-left' as const;
export const thLast =
  'whitespace-nowrap py-3.5 pl-3 pr-4 text-left sm:pr-0' as const;
export const tbody =
  'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900' as const;
export const row =
  'align-top text-sm text-zinc-400 dark:text-zinc-500' as const;
export const tdFirst = 'py-4 pl-4 pr-3 text-left sm:pl-0' as const;
export const tdMiddle = 'px-3 py-4 text-left' as const;
export const profileWrapper = 'flex flex-col gap-y-0.5' as const;
export const tdLast = 'table-cell py-4 pl-3 pr-4 text-left sm:pr-0' as const;

// Chain grid
export const chainGridBase =
  'grid grid-cols-2 gap-x-2 gap-y-1 lg:grid-cols-3' as const;
export const chainGridWide = 'min-w-md max-w-4xl lg:min-w-56' as const;
export const chainGridNarrow = 'min-w-56 max-w-3xl' as const;
export const chainItem = 'flex justify-start' as const;
export const chainInner = 'flex items-center gap-x-2' as const;
export const chainName =
  'whitespace-nowrap text-xs text-zinc-900 dark:text-zinc-100' as const;
export const notSupported =
  'whitespace-nowrap text-xs font-medium text-zinc-400 dark:text-zinc-500' as const;
export const statsWrapper = 'flex items-center gap-x-4' as const;
export const statsInner = 'flex items-center gap-x-1' as const;
export const statsActive =
  'text-xs font-medium text-zinc-900 dark:text-zinc-100' as const;
export const statsInactive =
  'text-xs font-medium text-zinc-400 dark:text-zinc-500' as const;

export const networkGraphStyles = {
  // Layout
  grid: 'grid lg:gap-x-4 xl:gap-x-16',
  gridWithTable: 'lg:grid-cols-2',
  gridWithoutTable: 'justify-center',
  graphContainer: '-ml-4 -mt-4 xl:-mt-2',

  // Table layout
  tableWrapper: 'lg:-mt-4',
  tableScrollContainer: '-mx-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible',
  table: 'min-w-full divide-y divide-zinc-200 dark:divide-zinc-700',

  // Table header
  thead: 'sticky top-0 z-10 bg-white dark:bg-zinc-900',
  headerRow: 'text-sm font-semibold text-zinc-800 dark:text-zinc-200',
  thSource: 'py-3.5 pl-4 pr-3 text-left sm:pl-0',
  thDefault: 'px-3 py-3.5 text-left',
  thRight: 'px-3 py-3.5 text-right',
  thLast: 'whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0',

  // Table body
  tbody:
    'divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900',
  bodyRow: 'align-top text-sm text-zinc-400 dark:text-zinc-500',
  tdSource: 'py-4 pl-4 pr-3 text-left sm:pl-0',
  tdDefault: 'px-3 py-4 text-left',
  tdRight: 'px-3 py-4 text-right',
  tdLast: 'py-4 pl-3 pr-4 text-right sm:pr-0',

  // Cell content
  cellContent: 'flex items-center justify-end',
  numberValue: 'font-medium text-zinc-900 dark:text-zinc-100',
  profileTitle: 'font-semibold',

  // Pagination
  paginationWrapper: 'mt-4 flex items-center justify-center',
} as const;

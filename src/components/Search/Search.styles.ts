// Search styles — Tailwind class constants

export const search = {
  wrapper: 'relative flex items-center',
  input:
    'h-10 w-full min-w-56 appearance-none rounded-lg border-zinc-200 bg-white pl-3 text-sm hover:border-blue-300 focus:border-blue-600 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-800 dark:focus:border-blue-500 sm:w-80',
  inputSearching: 'text-zinc-400 dark:text-zinc-600',
  inputIdle: 'text-zinc-600 dark:text-zinc-400',
  inputPaddingWithIcon: 'pr-10',
  inputPaddingDefault: 'pr-3',
  searchButton: 'absolute right-0 mr-2 !px-2',
  spinner: 'absolute right-0 top-0 mr-1 mt-1 !px-1',
} as const;

import clsx from 'clsx';

/**
 * Styles for the InterchainHeader component
 */

export const interchainHeaderStyles = {
  container: 'flex items-center gap-x-6',
  title: {
    container: 'sm:flex-auto',
    header: 'flex items-center gap-x-4',
    heading: 'text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100',
  },
  shortcuts: {
    container: 'mt-2 flex max-w-xl flex-wrap items-center',
    link: (isSelected: boolean) =>
      clsx(
        'mb-1 mr-4 flex min-w-max items-center whitespace-nowrap text-xs sm:mb-0 sm:text-sm',
        isSelected
          ? 'font-semibold text-blue-600 dark:text-blue-500'
          : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'
      ),
  },
  actions: {
    container: 'flex items-center gap-x-2',
  },
} as const;


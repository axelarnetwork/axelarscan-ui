import clsx from 'clsx';

/**
 * Styles for the Tops component
 */

export const topsStyles = {
  container: 'border-b border-b-zinc-200 dark:border-b-zinc-700',
  grid: {
    main: (hasTransfers: boolean, hasGMP: boolean) =>
      clsx(
        'grid lg:px-2 xl:px-0',
        hasTransfers && hasGMP ? '' : 'lg:grid-cols-2'
      ),
    topRow: (hasTransfers: boolean, hasGMP: boolean) =>
      clsx(
        'grid grid-cols-2 sm:grid-cols-3',
        hasTransfers && hasGMP ? 'lg:grid-cols-6' : ''
      ),
    middleRow: (hasTransfers: boolean, hasGMP: boolean) =>
      clsx(
        'grid sm:grid-cols-2',
        hasTransfers && hasGMP ? 'lg:grid-cols-4' : ''
      ),
    bottomRow: (hasTransfers: boolean) =>
      clsx(
        'grid sm:grid-cols-2 lg:grid-cols-4',
        !hasTransfers && 'lg:col-span-2'
      ),
  },
} as const;


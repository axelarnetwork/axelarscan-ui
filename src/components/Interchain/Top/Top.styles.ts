import clsx from 'clsx';

/**
 * Styles for the Top component
 */

function getBorderClasses(
  type: string,
  index: number,
  hasTransfers: boolean,
  hasGMP: boolean
): string {
  if (type === 'chain') {
    if (index % 3 !== 0) {
      return 'sm:border-l-0';
    }
    const divisor = hasTransfers ? 6 : 3;
    if (index % divisor !== 0) {
      return 'lg:border-l-0';
    }
    return '';
  }

  if (!hasTransfers || !hasGMP || index % 4 !== 0) {
    return 'sm:border-l-0';
  }
  return '';
}

function getPaddingClasses(type: string): string {
  return type === 'chain' ? 'py-4 xl:px-4' : 'py-8 xl:px-8';
}

export const topStyles = {
  container: (
    type: string,
    index: number,
    hasTransfers: boolean,
    hasGMP: boolean
  ) =>
    clsx(
      'flex flex-col gap-y-3 border-l border-r border-t border-zinc-200 px-4 dark:border-zinc-700 sm:px-6',
      getBorderClasses(type, index, hasTransfers, hasGMP),
      getPaddingClasses(type)
    ),
  header: {
    container: 'flex flex-col gap-y-0.5',
    title: 'text-sm font-semibold text-zinc-900 dark:text-zinc-100',
    description: 'text-xs font-normal text-zinc-400 dark:text-zinc-500',
  },
  content: {
    container: 'w-full',
    loading: 'flex h-full w-full items-center justify-center',
    list: (className?: string) =>
      clsx('flex flex-col gap-y-1 overflow-y-auto', className),
  },
} as const;

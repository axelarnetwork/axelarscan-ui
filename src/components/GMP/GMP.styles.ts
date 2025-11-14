export const gmpStyles = {
  actionRow: 'flex items-center gap-x-1',
  actionButtonBase:
    'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white',
  actionButtonProcessing: 'pointer-events-none bg-blue-400 dark:bg-blue-400',
  actionButtonReady:
    'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
  actionButton: (processing: boolean): string =>
    `flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display text-white ${
      processing
        ? 'pointer-events-none bg-blue-400 dark:bg-blue-400'
        : 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
    }`,
};

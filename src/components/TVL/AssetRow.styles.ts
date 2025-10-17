/**
 * Styles for the asset row component
 */

export const assetRowStyles = {
  row: 'align-top text-sm text-zinc-400 dark:text-zinc-500',

  // Cell styles
  cell: {
    assetName:
      'sticky left-0 z-10 px-3 py-4 text-left backdrop-blur backdrop-filter',
    standard: 'px-3 py-4 text-left',
    rightAlign: 'px-3 py-4 text-right',
  },

  // Asset name column content
  assetNameContent: 'flex items-center flex gap-x-2',

  // Profile component props
  assetProfile: {
    titleClass: 'font-bold',
  },
} as const;

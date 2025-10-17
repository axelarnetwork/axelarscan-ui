/**
 * Styles for the Tooltip component
 */

export const tooltipStyles = {
  // Parent container for relative positioning
  parent: 'group relative flex justify-center',

  // Tooltip popup container
  popup:
    'absolute -top-10 z-50 hidden rounded-lg bg-black px-2 py-1 group-hover:block',

  // Tooltip text content
  content: 'text-sm font-normal text-white',
} as const;

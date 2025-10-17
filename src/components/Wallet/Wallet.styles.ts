/**
 * Shared styles for wallet components
 * All wallet types (EVM, Cosmos, Stellar, XRPL, Sui) use these common button styles
 */

export const walletStyles = {
  // Button base styles
  button: {
    // Base button container
    base: 'flex h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1 font-display',

    // Connect button (blue)
    connect:
      'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',

    // Switch network button (neutral)
    switch:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',

    // Disconnect button (red)
    disconnect:
      'bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600',
  },

  // Special layouts
  layout: {
    // For XRPL wallet list
    walletList: 'flex flex-col gap-y-2',

    // For wallet buttons with icons
    buttonWithIcon: 'flex h-6 w-fit items-center gap-x-1.5',
  },
} as const;

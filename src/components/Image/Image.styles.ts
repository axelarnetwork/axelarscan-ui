/**
 * Styles for the Image component
 * Chain-specific logo styling for different blockchain networks
 */

export const imageStyles = {
  // Chain-specific background and styling classes
  chains: {
    // Full white background without padding
    fullWhiteBackground: 'rounded-full bg-white',

    // White background with small padding
    whiteBackground: 'rounded-full bg-white p-0.5',

    // Dark background with more padding
    darkBackground: 'rounded-full bg-zinc-900 p-1',
  },
} as const;

/**
 * Chains that require full white background (no padding)
 */
export const fullWhiteBackgroundChains: string[] = ['/immutable'];

/**
 * Chains that require white background with padding
 */
export const whiteBackgroundChains: string[] = [
  '/moonbeam',
  '/moonbase',
  '/dymension',
  '/saga',
  '/xion',
  '/allora',
  '/stellar',
  '/xrpl',
];

/**
 * Chains that require dark background with padding
 */
export const darkBackgroundChains: string[] = ['/blast'];

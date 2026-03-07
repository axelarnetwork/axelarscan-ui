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

/**
 * Determines additional CSS classes based on the image source path
 * Different chains/services require different styling for their logos
 *
 * @param src - Image source path
 * @returns CSS class string for chain-specific styling
 */
export function getChainSpecificClasses(src: string): string {
  if (!src || typeof src !== 'string') {
    return '';
  }

  // Chains that need full white background (no padding)
  if (fullWhiteBackgroundChains.some(p => src.includes(p))) {
    return imageStyles.chains.fullWhiteBackground;
  }

  // Chains that need white background with small padding
  if (whiteBackgroundChains.some(p => src.includes(p))) {
    return imageStyles.chains.whiteBackground;
  }

  // Chains that need dark background with more padding
  if (darkBackgroundChains.some(p => src.includes(p))) {
    return imageStyles.chains.darkBackground;
  }

  // No special styling needed
  return '';
}

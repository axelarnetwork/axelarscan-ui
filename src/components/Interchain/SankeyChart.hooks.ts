import { useCallback, useRef, useState } from 'react';

import { ProcessedChartDataItem } from './SankeyChart.utils';

/**
 * Hook to manage hover state for Sankey chart links
 */
export function useSankeyChartHover() {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const currentHoveredKeyRef = useRef<string | null>(null);

  // Optimized hover handler - only update if key actually changed
  const handleLinkHover = useCallback((link: ProcessedChartDataItem | null) => {
    const newKey = link?.key || null;

    // Only update state if the key actually changed
    if (newKey !== currentHoveredKeyRef.current) {
      currentHoveredKeyRef.current = newKey;

      if (hoverTimeoutRef.current !== null) {
        cancelAnimationFrame(hoverTimeoutRef.current);
      }

      // Use requestAnimationFrame for smoother, more efficient updates
      hoverTimeoutRef.current = requestAnimationFrame(() => {
        setHoveredKey(newKey);
        hoverTimeoutRef.current = null;
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current !== null) {
      cancelAnimationFrame(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    currentHoveredKeyRef.current = null;
    setHoveredKey(null);
  }, []);

  return {
    hoveredKey,
    handleLinkHover,
    handleMouseLeave,
  };
}

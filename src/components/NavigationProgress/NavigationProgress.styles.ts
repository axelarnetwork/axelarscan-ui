import type { CSSProperties } from 'react';

export const container =
  'fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none' as const;

export const bar = 'h-full bg-blue-600 dark:bg-blue-500' as const;

export function barTransition(progress: number): CSSProperties {
  return {
    width: `${progress}%`,
    opacity: progress >= 100 ? 0 : 1,
    transition:
      progress === 0
        ? 'none'
        : progress >= 100
          ? 'width 150ms ease-out, opacity 200ms ease 100ms'
          : 'width 400ms linear',
  };
}

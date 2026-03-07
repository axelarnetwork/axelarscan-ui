import type { ReactNode } from 'react';

export interface TooltipProps {
  content: ReactNode;
  className?: string;
  children: ReactNode;
  parentClassName?: string;
}

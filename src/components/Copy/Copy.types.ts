import type { ReactNode } from 'react';

export interface CopyProps {
  size?: number;
  value: unknown;
  onCopy?: () => void;
  children?: ReactNode;
  childrenClassName?: string;
  className?: string;
}

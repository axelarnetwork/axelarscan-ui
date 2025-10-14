'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

import { tooltipStyles } from './Tooltip.styles';

export interface TooltipProps {
  content: ReactNode;
  className?: string;
  children: ReactNode;
  parentClassName?: string;
}

export function Tooltip({
  content,
  className,
  children,
  parentClassName,
}: TooltipProps) {
  return (
    <div className={clsx(tooltipStyles.parent, parentClassName)}>
      <div className={tooltipStyles.popup}>
        <div className={clsx(tooltipStyles.content, className)}>{content}</div>
      </div>
      {children}
    </div>
  );
}

export const TooltipComponent = Tooltip;

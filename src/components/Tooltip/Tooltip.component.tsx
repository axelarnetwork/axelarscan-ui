'use client';

import clsx from 'clsx';

import { tooltipStyles } from './Tooltip.styles';
import type { TooltipProps } from './Tooltip.types';

export function Tooltip({
  content,
  className,
  children,
  parentClassName,
}: TooltipProps) {
  return (
    <span className={clsx(tooltipStyles.parent, parentClassName)}>
      <span className={tooltipStyles.popup}>
        <span className={clsx(tooltipStyles.content, className)}>
          {content}
        </span>
      </span>
      {children}
    </span>
  );
}

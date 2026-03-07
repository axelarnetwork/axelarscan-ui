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
    <div className={clsx(tooltipStyles.parent, parentClassName)}>
      <div className={tooltipStyles.popup}>
        <div className={clsx(tooltipStyles.content, className)}>{content}</div>
      </div>
      {children}
    </div>
  );
}

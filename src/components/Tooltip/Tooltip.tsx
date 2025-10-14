'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

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
    <div
      className={clsx('group relative flex justify-center', parentClassName)}
    >
      <div className="absolute -top-10 z-50 hidden rounded-lg bg-black px-2 py-1 group-hover:block">
        <div className={clsx('text-sm font-normal text-white', className)}>
          {content}
        </div>
      </div>
      {children}
    </div>
  );
}

export const TooltipComponent = Tooltip;

'use client';

import clsx from 'clsx';
import type React from 'react';

import { Tooltip } from '@/components/Tooltip';
import { isNumber } from '@/lib/number';

import { processNumberValue } from './Number.utils';

export interface NumberProps {
  value: number | string;
  format?: string;
  delimiter?: string;
  maxDecimals?: number;
  prefix?: string;
  suffix?: string;
  noTooltip?: boolean;
  tooltipContent?: string;
  className?: string;
}

export function Number({
  value,
  format = '0,0.00',
  delimiter = '.',
  maxDecimals,
  prefix = '',
  suffix = '',
  noTooltip = false,
  tooltipContent,
  className,
}: NumberProps): React.JSX.Element | undefined {
  // Early return if value is not a number
  if (!isNumber(value)) {
    return undefined;
  }

  // Process the number value using the utility function
  const { formattedValue, originalValue } = processNumberValue(
    value,
    delimiter,
    maxDecimals,
    format
  );

  // Determine display value and whether to show tooltip
  const displayValue = formattedValue ?? originalValue;
  const hasFormattedValue = formattedValue !== undefined;

  // Build the element
  const computedClassName = clsx('text-sm whitespace-nowrap', className);
  const displayText = `${prefix}${displayValue}${suffix}`;
  const tooltipText = `${prefix}${originalValue}${suffix}`;

  const element = <span className={computedClassName}>{displayText}</span>;

  // Determine if tooltip should be shown
  const shouldShowTooltipForFormatted = hasFormattedValue && !noTooltip;
  const shouldShowTooltip = shouldShowTooltipForFormatted || tooltipContent;

  if (shouldShowTooltip) {
    return (
      <Tooltip
        content={tooltipContent || tooltipText}
        className="whitespace-nowrap"
      >
        {element}
      </Tooltip>
    );
  }

  return element;
}

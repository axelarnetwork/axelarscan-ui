import clsx from 'clsx';

import { Number as NumberDisplay } from '@/components/Number';
import { isNumber, toNumber } from '@/lib/number';
import { progressBarStyles } from './ProgressBar.styles';
import type { ProgressBarProps } from './ProgressBar.types';

export function ProgressBar({
  value: rawValue,
  className,
  valueClassName,
}: ProgressBarProps) {
  let value = rawValue;
  if (isNumber(value)) {
    value = toNumber(value);
  }

  return (
    isNumber(value) && (
      <div className={progressBarStyles.track}>
        <div
          className={clsx(progressBarStyles.fill, className)}
          style={{ width: `${value}%` }}
        >
          <NumberDisplay
            value={value}
            format="0,0.0a"
            suffix="%"
            noTooltip={true}
            className={clsx(
              toNumber(value) < 33
                ? progressBarStyles.valueLow
                : progressBarStyles.valueHigh,
              valueClassName
            )}
          />
        </div>
      </div>
    )
  );
}

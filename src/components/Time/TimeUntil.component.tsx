'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { Tooltip } from '@/components/Tooltip';
import { isNumber } from '@/lib/number';
import { timeDiff, timeDiffString } from '@/lib/time';
import { timeStyles } from './Time.styles';
import type { TimeUntilProps } from './Time.types';

const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A';

export function TimeUntil({
  timestamp,
  format = TIME_FORMAT,
  prefix,
  suffix,
  noTooltip = true,
  title,
  className,
}: TimeUntilProps) {
  const [trigger, setTrigger] = useState(0);

  const time = timestamp || isNumber(timestamp) ? moment(timestamp) : null;
  const remaining = time ? timeDiff(moment(), 'seconds', time) : 0;

  useEffect(() => {
    if (!time || remaining <= 0) return;
    // Update every second when under 60s, every 30s otherwise
    const interval = remaining <= 59 ? 1000 : 30_000;
    const timeout = setTimeout(() => setTrigger(t => t + 1), interval);
    return () => clearTimeout(timeout);
  }, [trigger, time, remaining]);

  if (!time || remaining <= 0) return null;

  const timeDisplay = timeDiffString(moment(), time);

  let resolvedFormat = format;
  if (
    timeDiff(moment(), 'seconds', time) < 365 * 24 * 60 * 60 &&
    format === TIME_FORMAT
  ) {
    resolvedFormat = 'MMM D, H:mm:ss';
  }

  const element = (
    <span className={clsx(timeStyles.text, className)}>
      {prefix}
      {timeDisplay}
      {suffix}
    </span>
  );

  return noTooltip ? (
    element
  ) : (
    <Tooltip
      content={`${title ? `${title} ` : ''}${time.format(resolvedFormat)}`}
      className={timeStyles.tooltip}
    >
      {element}
    </Tooltip>
  );
}

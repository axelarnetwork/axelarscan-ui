'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { Tooltip } from '@/components/Tooltip';
import { isNumber } from '@/lib/number';
import { timeDiff, timeDiffString } from '@/lib/time';
import { timeStyles } from './Time.styles';
import type { TimeSpentProps } from './Time.types';

const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A';

export function TimeSpent({
  fromTimestamp,
  toTimestamp,
  format = TIME_FORMAT,
  noTooltip = true,
  title,
  className,
}: TimeSpentProps) {
  const [trigger, setTrigger] = useState(0);

  const hasFrom = !!(fromTimestamp || isNumber(fromTimestamp));
  const isLive = hasFrom && !toTimestamp;

  useEffect(() => {
    // Only tick when counting up (no toTimestamp). Completed durations are static.
    if (!isLive) return;
    const timeout = setTimeout(() => setTrigger(t => t + 1), 1000);
    return () => clearTimeout(timeout);
  }, [trigger, isLive]);

  if (!hasFrom) return null;

  const fromTime = moment(fromTimestamp);
  const toTime = toTimestamp ? moment(toTimestamp) : moment();
  const timeDisplay = timeDiffString(fromTime, toTime);

  let resolvedFormat = format;
  if (
    timeDiff(fromTime, 'seconds', toTime) < 365 * 24 * 60 * 60 &&
    format === TIME_FORMAT
  ) {
    resolvedFormat = 'MMM D, H:mm:ss';
  }

  const element = (
    <span className={clsx(timeStyles.text, className)}>{timeDisplay}</span>
  );

  return noTooltip ? (
    element
  ) : (
    <Tooltip
      content={`${title ? `${title} ` : ''}${fromTime.format(resolvedFormat)} - ${toTime.format(resolvedFormat)}`}
      className={timeStyles.tooltip}
    >
      {element}
    </Tooltip>
  );
}

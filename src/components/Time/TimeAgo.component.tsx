'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { Tooltip } from '@/components/Tooltip';
import { isNumber } from '@/lib/number';
import { timeDiff } from '@/lib/time';
import { timeStyles } from './Time.styles';
import type { TimeAgoProps } from './Time.types';

const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A';

export function TimeAgo({
  timestamp,
  format = TIME_FORMAT,
  noTooltip = false,
  title,
  className,
}: TimeAgoProps) {
  const [trigger, setTrigger] = useState(0);

  const time = (!timestamp && !isNumber(timestamp)) ? null : moment(timestamp);
  const diff = time ? timeDiff(time) : 0;

  useEffect(() => {
    // Update every second for recent timestamps, every 30s for older ones
    const interval = diff > 0 && diff <= 59 ? 1000 : 30_000;
    const timeout = setTimeout(() => setTrigger(t => t + 1), interval);
    return () => clearTimeout(timeout);
  }, [trigger, diff]);

  if (!time) return null;

  const timeDisplay = diff > 59 || diff <= 0 ? time.fromNow() : `${diff}s ago`;

  let resolvedFormat = format;
  if (diff < 30 * 24 * 60 * 60 && format === TIME_FORMAT) {
    resolvedFormat = 'MMM D, H:mm:ss';
  }

  const element = (
    <span className={clsx(timeStyles.text, className)}>{timeDisplay}</span>
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

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
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setTrigger(!trigger), 1000);
    return () => clearTimeout(timeout);
  }, [trigger, setTrigger]);

  if (!timestamp && !isNumber(timestamp)) return null;

  const time = moment(timestamp);
  const diff = timeDiff(time);
  const timeDisplay = diff > 59 || diff <= 0 ? time.fromNow() : `${diff}s ago`;

  let resolvedFormat = format;
  if (diff < 30 * 24 * 60 * 60 && format === TIME_FORMAT) {
    resolvedFormat = 'MMM D, H:mm:ss';
  }

  const element = (
    <span className={clsx(timeStyles.text, className)}>
      {timeDisplay}
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

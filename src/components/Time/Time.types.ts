import type { ReactNode } from 'react';

export interface TimeAgoProps {
  timestamp?: number | string;
  format?: string;
  noTooltip?: boolean;
  title?: string;
  className?: string;
}

export interface TimeSpentProps {
  fromTimestamp?: number | string;
  toTimestamp?: number | string;
  format?: string;
  noTooltip?: boolean;
  title?: string;
  className?: string;
}

export interface TimeUntilProps {
  timestamp: number | string;
  format?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  noTooltip?: boolean;
  title?: string;
  className?: string;
}

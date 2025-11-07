import moment from 'moment';

import { timeDiff } from '@/lib/time';

/**
 * Calculates the appropriate granularity (day, week, or month) based on time range
 */
export const calculateGranularity = (
  fromTimestamp: number,
  toTimestamp: number
): 'day' | 'week' | 'month' => {
  if (!fromTimestamp) return 'month';

  const diffInDays = timeDiff(fromTimestamp * 1000, 'days', toTimestamp * 1000);

  if (diffInDays >= 180) {
    return 'month';
  } else if (diffInDays >= 60) {
    return 'week';
  }

  return 'day';
};

/**
 * Time range shortcuts for quick filtering
 */
export const TIME_RANGE_SHORTCUTS = [
  {
    label: 'Last 7 days',
    value: [moment().subtract(7, 'days').startOf('day'), moment().endOf('day')],
  },
  {
    label: 'Last 30 days',
    value: [
      moment().subtract(30, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  {
    label: 'Last 365 days',
    value: [
      moment().subtract(365, 'days').startOf('day'),
      moment().endOf('day'),
    ],
  },
  { label: 'All-time', value: [] },
] as const;

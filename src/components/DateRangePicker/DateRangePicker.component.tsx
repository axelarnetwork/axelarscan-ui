'use client';

import { DatePicker } from 'antd';
import clsx from 'clsx';
import moment from 'moment';
import dayjs from 'dayjs';

import { isNumber, toNumber } from '@/lib/number';

import * as styles from './DateRangePicker.styles';

export const createDayJSFromUnixtime = (unixtime: number | string) =>
  dayjs(isNumber(unixtime) ? toNumber(unixtime) * 1000 : unixtime);

const getUnixtime = (time: { valueOf: () => number } | null | undefined) =>
  time && moment(time.valueOf()).unix();

import type { DateRangePickerProps } from './DateRangePicker.types';

export function DateRangePicker({
  params,
  format = 'YYYY/MM/DD HH:mm:ss',
  onChange,
  className,
}: DateRangePickerProps) {
  const { fromTime, toTime } = { ...params };

  return (
    <DatePicker.RangePicker
      showTime
      format={format}
      presets={[
        {
          label: 'Today',
          value: [dayjs().startOf('day'), dayjs().endOf('day')],
        },
        {
          label: 'Last 24 Hours',
          value: [dayjs().subtract(24, 'hours'), dayjs().endOf('hour')],
        },
        {
          label: 'Last 7 Days',
          value: [
            dayjs().subtract(7, 'days').startOf('day'),
            dayjs().endOf('day'),
          ],
        },
        {
          label: 'This Month',
          value: [dayjs().startOf('month'), dayjs().endOf('month')],
        },
        {
          label: 'Last Month',
          value: [
            dayjs().subtract(1, 'months').startOf('month'),
            dayjs().subtract(1, 'months').endOf('month'),
          ],
        },
        {
          label: 'Last 30 Days',
          value: [
            dayjs().subtract(30, 'days').startOf('day'),
            dayjs().endOf('day'),
          ],
        },
        {
          label: 'Last 90 Days',
          value: [
            dayjs().subtract(90, 'days').startOf('day'),
            dayjs().endOf('day'),
          ],
        },
        {
          label: 'Last 180 Days',
          value: [
            dayjs().subtract(180, 'days').startOf('day'),
            dayjs().endOf('day'),
          ],
        },
        {
          label: 'Last 365 Days',
          value: [
            dayjs().subtract(365, 'days').startOf('day'),
            dayjs().endOf('day'),
          ],
        },
        {
          label: 'This Year',
          value: [dayjs().startOf('year'), dayjs().endOf('year')],
        },
        {
          label: 'Last Year',
          value: [
            dayjs().subtract(1, 'years').startOf('year'),
            dayjs().subtract(1, 'years').endOf('year'),
          ],
        },
        { label: 'All Time', value: [null, null] as [null, null] },
      ]}
      value={
        fromTime && toTime
          ? [createDayJSFromUnixtime(fromTime), createDayJSFromUnixtime(toTime)]
          : undefined
      }
      onChange={(v: Array<{ valueOf: () => number } | null> | null) =>
        onChange({
          fromTime: getUnixtime(v?.[0]) as number | undefined,
          toTime: getUnixtime(v?.[1]) as number | undefined,
        })
      }
      className={clsx(styles.rangePicker, className)}
    />
  );
}

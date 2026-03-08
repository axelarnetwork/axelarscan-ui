import dayjs from 'dayjs';
import moment from 'moment';

import { isNumber, toNumber } from '@/lib/number';

export const createDayJSFromUnixtime = (unixtime: number | string) =>
  dayjs(isNumber(unixtime) ? toNumber(unixtime) * 1000 : unixtime);

export const getUnixtime = (
  time: { valueOf: () => number } | null | undefined
) => time && moment(time.valueOf()).unix();

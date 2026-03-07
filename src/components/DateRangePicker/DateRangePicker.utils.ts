import dayjs from 'dayjs';

import { isNumber, toNumber } from '@/lib/number';

export const createDayJSFromUnixtime = (unixtime: number | string) =>
  dayjs(isNumber(unixtime) ? toNumber(unixtime) * 1000 : unixtime);

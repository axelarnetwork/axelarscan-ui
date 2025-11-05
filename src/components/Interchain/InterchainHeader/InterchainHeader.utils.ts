import { toNumber } from '@/lib/number';
import { getQueryString } from '@/lib/operator';
import _ from 'lodash';
import { type Moment } from 'moment';

import { FilterParams } from './Interchain.types';

export function isShortcutSelected(
  shortcutValue: readonly [Moment, Moment] | readonly [],
  fromTime?: number,
  toTime?: number
): boolean {
  const shortcutFromTime = _.head(shortcutValue);
  const shortcutToTime = _.last(shortcutValue);

  const fromMatches =
    (!fromTime && !shortcutFromTime) ||
    shortcutFromTime?.unix() === toNumber(fromTime);

  const toMatches =
    (!toTime && !shortcutToTime) || shortcutToTime?.unix() === toNumber(toTime);

  return fromMatches && toMatches;
}

export function buildShortcutUrl(
  pathname: string,
  params: FilterParams,
  shortcutValue: readonly [Moment, Moment] | readonly []
): string {
  const shortcutFromTime = _.head(shortcutValue)?.unix();
  const shortcutToTime = _.last(shortcutValue)?.unix();

  return `${pathname}${getQueryString({
    ...params,
    fromTime: shortcutFromTime,
    toTime: shortcutToTime,
  })}`;
}

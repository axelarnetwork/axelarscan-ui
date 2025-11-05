import moment from 'moment';

export const timeDiff = (
  fromTime: moment.MomentInput = moment().subtract(5, 'minutes'),
  unit: moment.unitOfTime.Diff = 'seconds',
  toTime: moment.MomentInput = moment(),
  exact: boolean = false
): number => moment(toTime).diff(moment(fromTime), unit, exact);

export const timeDiffString = (
  fromTime?: moment.MomentInput,
  toTime?: moment.MomentInput
): string => {
  const diff = timeDiff(fromTime, 'seconds', toTime);

  if (diff < 60) return `${diff}s`;
  if (diff < 2 * 60 * 60)
    return `${Math.floor(diff / 60)}m${diff % 60 > 0 ? ` ${diff % 60}s` : ''}`;
  if (diff < 24 * 60 * 60) return moment.utc(diff * 1000).format('HH:mm:ss');
  if (!(fromTime && toTime))
    return `${timeDiff(moment().subtract(diff, 'seconds'), 'days')} day`;
  if (diff < 30 * 24 * 60 * 60)
    return `${timeDiff(fromTime, 'hours', toTime)} hours`;

  return `${timeDiff(fromTime, 'days', toTime)} days`;
};

export const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A z';


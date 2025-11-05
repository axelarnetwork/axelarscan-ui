import _ from 'lodash';
import moment from 'moment';

import { headString, lastString } from '@/lib/string';
import { toArray } from '@/lib/parser';
import { ChartDataPoint } from './Interchain.types';

/**
 * Extracts chart data points from unknown data structure
 * Handles both array format and object with data property
 */
export function extractChartDataPoints(
  data: unknown
): ChartDataPoint[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const dataObj = data as { data?: unknown };
    if ('data' in dataObj && Array.isArray(dataObj.data)) {
      return dataObj.data;
    }
  }

  return [];
}

/**
 * Gets the focus time string based on granularity
 */
export function getFocusTimeString(
  time: moment.Moment,
  granularity: string,
  dateFormat: string
): string {
  if (granularity === 'month') {
    return time.format('MMM YYYY');
  }
  if (granularity === 'week') {
    return [
      time.format(dateFormat),
      moment(time).add(7, 'days').format(dateFormat),
    ].join(' - ');
  }
  return time.format(dateFormat);
}

/**
 * Gets the domain for YAxis based on useStack and stacks
 */
export function getDomain(
  useStack: boolean,
  stacks: string[],
  chartData: ChartDataPoint[],
  field: string
): ['dataMin', 'dataMax'] | [number, number] {
  if (useStack) {
    return ['dataMin', 'dataMax'];
  }

  return [
    _.min(
      stacks.map(
        s =>
          _.minBy(chartData, `${s}_${field}`)?.[`${s}_${field}`] as number
      )
    ) ?? 0,
    _.max(
      stacks.map(
        s =>
          _.maxBy(chartData, `${s}_${field}`)?.[`${s}_${field}`] as number
      )
    ) ?? 1,
  ];
}

/**
 * Gets the chart value based on selected data point or total
 */
export function getChartValue(
  selectedData: ChartDataPoint | undefined,
  chartData: ChartDataPoint[] | null,
  field: string,
  totalValue?: number
): number | undefined {
  if (selectedData && field) {
    return selectedData[field] as number | undefined;
  }

  if (chartData && chartData.length > 0 && field) {
    return totalValue || _.sumBy(chartData, field);
  }

  return undefined;
}

/**
 * Gets the time string for display based on selected data point or chart range
 */
export function getChartTimeString(
  selectedData: ChartDataPoint | undefined,
  chartData: ChartDataPoint[] | null
): string | undefined {
  if (selectedData) {
    return selectedData.focusTimeString;
  }

  if (chartData && chartData.length > 0) {
    const filteredData = chartData.filter(d => d?.timestamp);
    const firstData = _.head(filteredData) as ChartDataPoint | undefined;
    const lastData = _.last(filteredData) as ChartDataPoint | undefined;

    if (firstData || lastData) {
      return toArray([
        headString(firstData?.focusTimeString, ' - '),
        lastString(lastData?.focusTimeString, ' - '),
      ]).join(' - ');
    }
  }

  return undefined;
}

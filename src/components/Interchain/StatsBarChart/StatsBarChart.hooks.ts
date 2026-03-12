import moment from 'moment';
import { useMemo } from 'react';

import { ChartDataPoint } from '../Interchain.types';
import {
  extractChartDataPoints,
  getFocusTimeString,
} from './StatsBarChart.utils';
import type { UseChartDataParams } from './StatsBarChart.types';

/**
 * Hook to process and manage chart data
 */
export function useChartData({
  data,
  field,
  dateFormat,
  granularity,
}: UseChartDataParams) {
  return useMemo<ChartDataPoint[] | null>(() => {
    if (!data) {
      return null;
    }

    const chartDataPoints = extractChartDataPoints(data);

    return chartDataPoints.map((d: Record<string, unknown>) => {
      const time = moment(d.timestamp as number).utc();
      const timeString = time.format(dateFormat);
      const focusTimeString = getFocusTimeString(time, granularity, dateFormat);

      return {
        ...d,
        timeString,
        focusTimeString,
      };
    });
  }, [data, field, dateFormat, granularity]);
}

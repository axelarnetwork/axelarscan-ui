import moment from 'moment';
import { useEffect, useState } from 'react';

import { ChartDataPoint } from './Interchain.types';
import {
  extractChartDataPoints,
  getFocusTimeString,
} from './StatsBarChart.utils';

interface UseChartDataParams {
  data: unknown;
  field: string;
  dateFormat: string;
  granularity: string;
}

/**
 * Hook to process and manage chart data
 */
export function useChartData({
  data,
  field,
  dateFormat,
  granularity,
}: UseChartDataParams) {
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);

  useEffect(() => {
    if (!data) {
      setChartData(null);
      return;
    }

    const chartDataPoints = extractChartDataPoints(data);

    setChartData(
      chartDataPoints.map((d: Record<string, unknown>) => {
        const time = moment(d.timestamp as number).utc();
        const timeString = time.format(dateFormat);
        const focusTimeString = getFocusTimeString(
          time,
          granularity,
          dateFormat
        );

        return {
          ...d,
          timeString,
          focusTimeString,
        };
      })
    );
  }, [data, field, dateFormat, granularity]);

  return chartData;
}

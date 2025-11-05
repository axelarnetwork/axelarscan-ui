import { ChartDataPoint } from './Interchain.types';

export interface StatsBarChartProps {
  i: number;
  data: ChartDataPoint[] | { data?: ChartDataPoint[] };
  totalValue?: number;
  field?: string;
  stacks?: string[];
  colors?: Record<string, string>;
  useStack?: boolean;
  title?: string;
  description?: string;
  dateFormat?: string;
  granularity?: string;
  valueFormat?: string;
  valuePrefix?: string;
}

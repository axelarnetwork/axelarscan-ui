import { ChartDataPoint, CustomTooltipProps } from '../Interchain.types';

export interface StatsBarChartTooltipProps extends CustomTooltipProps {
  stacks: string[];
  field: string;
  valueFormat: string;
  valuePrefix: string;
}

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

export interface UseChartDataParams {
  data: unknown;
  field: string;
  dateFormat: string;
  granularity: string;
}

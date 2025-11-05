import { GroupDataItem } from '../Interchain.types';

export interface SankeyChartProps {
  i: number;
  data: GroupDataItem[];
  topN?: number;
  totalValue?: number;
  field?: string;
  title?: string;
  description?: string;
  valueFormat?: string;
  valuePrefix?: string;
  noBorder?: boolean;
  className?: string;
}

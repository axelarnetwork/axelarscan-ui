import type { ReactNode } from 'react';
import { GroupDataItem } from '../Interchain.types';

export interface SankeyChartProps {
  i: number;
  data: GroupDataItem[];
  topN?: number;
  totalValue?: number;
  field?: string;
  title?: ReactNode;
  description?: string;
  valueFormat?: string;
  valuePrefix?: string;
  noBorder?: boolean;
  className?: string;
}

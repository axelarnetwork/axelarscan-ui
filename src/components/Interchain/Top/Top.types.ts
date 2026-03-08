import type { Chain } from '@/types';
import { GroupDataItem, InterchainData } from '../Interchain.types';

export interface TopItemProps {
  data: Record<string, unknown>;
  type: string;
  field: string;
  format: string;
  prefix: string;
  transfersType?: string;
  chains: Chain[] | null;
}

export interface TopProps {
  index: number;
  data: InterchainData | GroupDataItem[];
  type?: string;
  hasTransfers?: boolean;
  hasGMP?: boolean;
  hasITS?: boolean;
  transfersType: string;
  field?: string;
  title?: string;
  description?: string;
  format?: string;
  prefix?: string;
  totalValue?: number;
  className?: string;
}

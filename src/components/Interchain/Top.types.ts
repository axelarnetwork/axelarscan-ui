import { GroupDataItem, InterchainData } from './Interchain.types';

export interface TopProps {
  i: number;
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

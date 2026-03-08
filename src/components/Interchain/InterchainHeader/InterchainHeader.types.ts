import type { FilterParams } from '../Interchain.types';

export interface InterchainHeaderProps {
  pathname: string;
  params: FilterParams;
  contractAddress?: string | string[];
  contractMethod?: string | string[];
  fromTime?: number;
  toTime?: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

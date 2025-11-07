import { FilterParams, InterchainData } from '../Interchain.types';

export interface ChartsProps {
  data: InterchainData;
  granularity: string;
  params?: FilterParams;
}

import { FilterParams, InterchainData } from '../Interchain.types';

export interface TopsProps {
  data: InterchainData;
  types: string[];
  params: FilterParams;
}

import { InterchainData, TimeSpentData } from '../Interchain.types';

export interface GMPTimeSpentProps {
  data: InterchainData | TimeSpentData;
  format?: string;
  prefix?: string;
}

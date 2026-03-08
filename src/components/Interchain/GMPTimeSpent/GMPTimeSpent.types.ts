import { InterchainData, TimeSpentData } from '../Interchain.types';

export interface GMPTimeSpentPointProps {
  title: string;
  name: string;
  noTooltip?: boolean;
}

export interface GMPTimeSpentProps {
  data: InterchainData | TimeSpentData;
  format?: string;
  prefix?: string;
}

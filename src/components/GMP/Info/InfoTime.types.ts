import type { ChainTimeEstimate, GMPMessage } from '../GMP.types';

export interface InfoTimeProps {
  isMultihop: boolean;
  executedGMPsData: GMPMessage[];
  timeSpent: GMPMessage['time_spent'];
  status?: string;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  fees?: GMPMessage['fees'];
  confirm?: GMPMessage['confirm'];
  approved?: GMPMessage['approved'];
  call?: GMPMessage['call'];
}

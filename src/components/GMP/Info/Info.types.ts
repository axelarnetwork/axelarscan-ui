import { ChainTimeEstimate, GMPMessage } from '../GMP.types';

export interface InfoProps {
  data: GMPMessage;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  executeData?: string | null;
  refreshData: () => Promise<GMPMessage | undefined>;
  tx?: string;
  lite?: boolean;
}

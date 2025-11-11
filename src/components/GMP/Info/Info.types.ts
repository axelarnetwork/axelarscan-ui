import { ChainTimeEstimate, GMPMessage, GMPRecoveryActions } from '../GMP.types';

export interface InfoProps {
  data: GMPMessage;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  executeData?: string | null;
  recovery: GMPRecoveryActions;
  tx?: string;
  lite?: boolean;
}

import { ChainTimeEstimate, ChainMetadata, GMPMessage, GMPEventLog } from '../GMP.types';

export interface StatusTimelineProps {
  timeline: GMPMessage[];
  chains: ChainMetadata[] | null | undefined;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  isMultihop: boolean;
  rootCall: GMPMessage['call'];
  expressExecuted?: GMPMessage['express_executed'];
}

export interface ConfirmTimeEstimateProps {
  id: string;
  expressExecuted?: GMPEventLog;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  rootCall?: { block_timestamp?: number };
}

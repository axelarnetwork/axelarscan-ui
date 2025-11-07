import { ChainTimeEstimate, ChainMetadata, GMPMessage } from '../GMP.types';

export interface StatusTimelineProps {
  timeline: GMPMessage[];
  chains: ChainMetadata[] | undefined;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  isMultihop: boolean;
  rootCall: GMPMessage['call'];
  expressExecuted?: GMPMessage['express_executed'];
}



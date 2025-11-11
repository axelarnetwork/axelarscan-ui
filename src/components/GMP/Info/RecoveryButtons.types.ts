import type { ChainMetadata, ChainTimeEstimate, GMPMessage } from '../GMP.types';

export interface RecoveryButtonsProps {
  data: GMPMessage;
  chains: ChainMetadata[] | null;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  refreshData: () => Promise<GMPMessage | undefined>;
}


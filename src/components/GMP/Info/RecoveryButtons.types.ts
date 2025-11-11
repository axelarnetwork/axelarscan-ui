import type {
  ChainMetadata,
  ChainTimeEstimate,
  GMPMessage,
  GMPRecoveryActions,
} from '../GMP.types';

export interface RecoveryButtonsProps {
  data: GMPMessage;
  chains: ChainMetadata[] | null;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  recovery: GMPRecoveryActions;
}


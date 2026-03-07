import type { ChainMetadata, GMPMessage } from '../GMP.types';

export interface TransfersProps {
  data: GMPMessage;
  chains: ChainMetadata[] | null | undefined;
}

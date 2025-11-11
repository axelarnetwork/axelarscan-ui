import type { ChainMetadata, GMPMessage } from '../GMP.types';

export interface InfoTransfersProps {
  data: GMPMessage;
  chains: ChainMetadata[] | undefined;
}


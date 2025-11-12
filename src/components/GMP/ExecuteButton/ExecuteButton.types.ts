import type { Dispatch, SetStateAction } from 'react';
import type { ChainMetadata, GMPMessage, GMPToastState } from '../GMP.types';

export interface ExecuteButtonProps {
  data: GMPMessage | null;
  processing: boolean;
  chains: ChainMetadata[] | null;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setResponse: Dispatch<SetStateAction<GMPToastState | null>>;
  refreshData: () => Promise<GMPMessage | undefined>;
}

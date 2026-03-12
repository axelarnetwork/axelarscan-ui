import type { GMPMessage } from '../GMP.types';

export interface PathProps {
  data: GMPMessage;
  isMultihop: boolean;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
}

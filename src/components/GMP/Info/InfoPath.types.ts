import type { GMPMessage } from '../GMP.types';

export interface InfoPathProps {
  data: GMPMessage;
  isMultihop: boolean;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
}

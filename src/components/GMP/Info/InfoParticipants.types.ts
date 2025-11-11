import type { GMPMessage } from '../GMP.types';

export interface InfoParticipantsProps {
  data: GMPMessage;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
  senderAddress?: string;
  sourceAddress?: string;
  contractAddress?: string;
  lite?: boolean;
  showAdditionalDetails: boolean;
  call?: GMPMessage['call'];
}


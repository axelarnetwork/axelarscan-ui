import {
  ChainMetadata,
  ChainTimeEstimate,
  GMPButtonMap,
  GMPMessage,
  GMPTransactionInfo,
} from '../GMP.types';

export interface InfoProps {
  data: GMPMessage;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  executeData?: string | null;
  buttons: GMPButtonMap;
  tx?: string;
  lite?: boolean;
}

export interface InfoHeaderProps {
  call?: GMPTransactionInfo;
  messageId?: string;
  txhash?: string;
  url?: string;
  transactionPath?: string;
  sourceChain: string | undefined;
}

export interface InfoPathProps {
  data: GMPMessage;
  isMultihop: boolean;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
}

export interface InfoSettlementProps {
  data: GMPMessage;
  settlementForwardedEvents?: GMPMessage['settlement_forwarded_events'];
  settlementFilledEvents?: GMPMessage['settlement_filled_events'];
  txhash?: string;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
  executed: GMPMessage['executed'];
}

export interface InfoTransfersProps {
  data: GMPMessage;
  chains: ChainMetadata[] | undefined;
}

export interface InfoTimeProps {
  isMultihop: boolean;
  executedGMPsData: GMPMessage[];
  timeSpent: GMPMessage['time_spent'];
  status?: string;
  estimatedTimeSpent?: ChainTimeEstimate | null;
  fees?: GMPMessage['fees'];
  confirm?: GMPMessage['confirm'];
  approved?: GMPMessage['approved'];
  call?: GMPMessage['call'];
}

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



import type { GMPMessage } from '../GMP.types';

export interface InfoSettlementProps {
  data: GMPMessage;
  settlementForwardedEvents?: GMPMessage['settlement_forwarded_events'];
  settlementFilledEvents?: GMPMessage['settlement_filled_events'];
  txhash?: string;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
  executed: GMPMessage['executed'];
}


import type { GMPMessage, GMPSettlementData } from '../GMP.types';

export interface SettlementProps {
  data: GMPMessage;
  settlementForwardedEvents?: GMPMessage['settlement_forwarded_events'];
  settlementFilledEvents?: GMPMessage['settlement_filled_events'];
  txhash?: string;
  sourceChain: string | undefined;
  destinationChain: string | undefined;
  executed: GMPMessage['executed'];
}

export interface SettlementColumnProps {
  title: string;
  /** Primary ExplorerLink shown when the direct event exists */
  primaryLink?: {
    value?: string;
    chain?: string;
  };
  /** Fallback entries shown when there is no direct event */
  fallbackEntries: GMPSettlementData[];
  /** Whether to use executed data from each entry */
  useExecuted?: boolean;
  /** Whether to show the arrow icon after the column */
  showArrow?: boolean;
}

import type { GMPTransactionInfo } from '../GMP.types';

export interface InfoHeaderProps {
  call?: GMPTransactionInfo;
  messageId?: string;
  txhash?: string;
  url?: string;
  transactionPath?: string;
  sourceChain: string | undefined;
}

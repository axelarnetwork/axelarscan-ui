import type { GMPTransactionInfo } from '../GMP.types';

export interface HeaderProps {
  call?: GMPTransactionInfo;
  messageId?: string;
  txhash?: string;
  url?: string;
  transactionPath?: string;
  sourceChain: string | undefined;
}

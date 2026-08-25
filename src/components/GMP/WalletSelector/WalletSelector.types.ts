import { ChainMetadata } from '../GMP.types';

export interface WalletSelectorProps {
  targetChain: string | undefined;
  targetChainType: string | undefined;
  chains: ChainMetadata[] | null;
}

export interface UnsupportedWalletNoticeProps {
  targetChain: string | undefined;
}

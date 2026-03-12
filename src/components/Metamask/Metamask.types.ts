export interface TokenData {
  address?: string;
  tokenAddress?: string;
  symbol?: string;
  decimals?: number;
  image?: string;
  [key: string]: unknown;
}

export interface ChainIdState {
  chainId: number | null;
  setChainId: (data: number | null) => void;
}

export interface AddMetamaskProps {
  chain?: string;
  asset?: string;
  type?: string;
  width?: number;
  height?: number;
  noTooltip?: boolean;
}

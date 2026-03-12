export interface AssetAddress {
  address?: string;
  ibc_denom?: string;
  symbol?: string;
  contract_address?: string;
  decimals?: number;
  image?: string;
  [key: string]: unknown;
}

export interface Asset {
  id: string;
  denom?: string;
  denoms?: string[];
  symbol?: string;
  name?: string;
  image?: string;
  price?: number;
  decimals?: number;
  no_tvl?: boolean;
  is_custom?: boolean;
  type?: string;
  address?: string;
  addresses?: Record<string, AssetAddress>;
  [key: string]: unknown;
}

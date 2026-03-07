import type { Chain, Asset } from '@/types';

export type { Chain, Asset };

export interface ContractData {
  is_custom?: boolean;
  token_manager_type?: string;
  is_native?: boolean;
  native_chain?: string;
}

export interface DenomData {
  is_native?: boolean;
  native_chain?: string;
}

export interface CustomBalance {
  balance?: number;
  supply?: number;
  url?: string;
}

export interface TVLPerChain {
  supply?: number;
  total?: number;
  escrow_balance?: number;
  url?: string;
  custom_contracts_balance?: CustomBalance[];
  custom_tokens_supply?: CustomBalance[];
  contract_data?: ContractData;
  denom_data?: DenomData;
  token_manager_type?: string;
}

export interface ChainWithTotalValue extends Chain {
  total_value: number;
}

export interface NativeChain {
  chain: string;
  chainData: Chain;
  url?: string;
  contract_data?: ContractData;
  denom_data?: DenomData;
}

export interface RawTVLData {
  asset: string;
  assetType: string;
  total_on_evm: number;
  total_on_cosmos: number;
  total_on_contracts: number;
  total_on_tokens: number;
  total: number;
  price?: number;
  tvl: Record<string, TVLPerChain>;
}

export interface ProcessedTVLData extends RawTVLData {
  i: number;
  j: number;
  assetData?: Asset;
  value_on_evm: number;
  value_on_cosmos: number;
  value: number;
  nativeChain?: NativeChain;
}

export interface GlobalStore {
  chains: Chain[] | null;
  assets: Asset[] | null;
  itsAssets: Asset[] | null;
  tvl: {
    data: RawTVLData[];
  } | null;
}

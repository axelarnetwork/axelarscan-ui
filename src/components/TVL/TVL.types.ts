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

export interface AssetData {
  symbol: string;
  price?: number;
  type?: string;
  no_tvl?: boolean;
  is_custom?: boolean;
  image?: string;
  addresses?: Record<string, unknown>;
  chains?: Record<string, unknown>;
}

export interface ITSAssetData {
  id?: string;
  symbol: string;
  price?: number;
  type?: string;
  image?: string;
  addresses?: string[];
  address?: string;
}

export interface ChainData {
  id: string;
  name: string;
  image: string;
  chain_type?: string;
  chain_id?: string;
  chain_name?: string;
  maintainer_id?: string;
  aliases?: string[];
  prefix_address?: string;
  prefix_chain_ids?: string[];
  no_inflation?: boolean;
  no_tvl?: boolean;
}

export interface ChainWithTotalValue extends ChainData {
  total_value: number;
}

export interface NativeChain {
  chain: string;
  chainData: ChainData;
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
  assetData?: AssetData;
  value_on_evm: number;
  value_on_cosmos: number;
  value: number;
  nativeChain?: NativeChain;
}

export interface GlobalStore {
  chains: ChainData[] | null;
  assets: AssetData[] | null;
  itsAssets: ITSAssetData[] | null;
  tvl: {
    data: RawTVLData[];
  } | null;
}

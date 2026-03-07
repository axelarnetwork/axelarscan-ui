import type { Chain } from '@/types';

export interface SelectOption {
  value?: string;
  title: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  multiple?: boolean;
  options?: SelectOption[];
}

export interface ChainProps {
  data: ChainResourceData;
}

export interface AssetProps {
  data: AssetResourceData;
  focusID: string | null;
  onFocus: (id: string) => void;
}

export interface ResourcesProps {
  resource?: string;
}

export interface ContractRef {
  address?: string;
  [key: string]: unknown;
}

export type ChainResourceData = Chain & {
  gateway?: ContractRef;
  multisig_prover?: ContractRef;
  voting_verifier?: ContractRef;
  router?: ContractRef;
  service_registry?: ContractRef;
  rewards?: ContractRef;
  multisig?: ContractRef;
};

export interface AssetAddressEntry {
  address?: string;
  tokenAddress?: string;
  ibc_denom?: string;
  symbol?: string;
  image?: string;
  [key: string]: unknown;
}

export interface AssetResourceData {
  id: string;
  type?: string;
  denom?: string;
  denoms?: string[];
  native_chain?: string;
  symbol?: string;
  name?: string;
  image?: string;
  decimals?: number;
  addresses?: Record<string, AssetAddressEntry>;
  chains?: Record<string, AssetAddressEntry>;
  [key: string]: unknown;
}

export interface NormalizedAssetAddress extends AssetAddressEntry {
  chain?: string;
}

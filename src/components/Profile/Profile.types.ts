import type { StaticImageData } from 'next/image';

export interface NameServiceEntry {
  name?: string;
  [key: string]: unknown;
}

export interface NameServicesState {
  ens: Record<string, NameServiceEntry> | null;
  spaceID: Record<string, NameServiceEntry> | null;
  setENS: (data: Record<string, NameServiceEntry>) => void;
  setSpaceID: (data: Record<string, NameServiceEntry>) => void;
}

export interface ValidatorImageEntry {
  image?: string;
  updatedAt?: number;
}

export interface ValidatorImagesState {
  validatorImages: Record<string, ValidatorImageEntry>;
  setValidatorImages: (data: Record<string, ValidatorImageEntry>) => void;
}

export interface SpaceIDProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
}

export interface ENSProfileProps {
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  origin?: string;
  className?: string;
}

export interface EVMProfileProps {
  chain?: string;
  address: string;
  url?: string;
  width?: number;
  height?: number;
  noCopy?: boolean;
  className?: string;
  [key: string]: unknown;
}

export interface NameServiceImageProps {
  src: string;
  fallbackSrc: StaticImageData;
  width: number;
  height: number;
  onLoad?: () => void;
}

export interface NameServiceContentProps {
  url?: string;
  noCopy: boolean;
  address: string;
  width: number;
  className?: string;
  element: React.ReactNode;
}

export interface ProfileProps {
  address: string | number[] | null | undefined;
  chain?: string;
  prefix?: string;
  width?: number;
  height?: number;
  noResolveName?: boolean;
  noCopy?: boolean;
  customURL?: string;
  useContractLink?: boolean;
  className?: string;
}

export interface KeybaseUserResponse {
  them?: Array<{
    pictures?: {
      primary?: { url?: string };
    };
  }>;
}

export interface AccountEntry {
  address: string;
  name: string;
  image?: string;
  chain?: string;
  environment?: string;
}

export interface ContractsData {
  interchain_token_service_contract?: {
    addresses?: string[];
    [key: string]: unknown;
  };
  gateway_contracts?: Record<
    string,
    { address?: string; [key: string]: unknown }
  >;
  gas_service_contracts?: Record<
    string,
    { address?: string; [key: string]: unknown }
  >;
  [key: string]: unknown;
}

export interface ConfigurationsData {
  relayers?: string[];
  express_relayers?: string[];
  refunders?: string[];
  [key: string]: unknown;
}

export interface ProfileData {
  address: string;
  chain: string;
  prefix: string;
  name: string | undefined;
  image: string | undefined;
  isValidator: boolean | undefined;
  isVerifier: boolean | undefined;
  url: string | undefined;
  copySize: number;
}

export interface ChainProfileProps {
  value?: string;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}

export interface AssetProfileProps {
  value?: string;
  chain?: string;
  amount?: number | string;
  addressOrDenom?: string;
  customAssetData?: Record<string, unknown>;
  ITSPossible?: boolean;
  onlyITS?: boolean;
  isLink?: boolean;
  width?: number;
  height?: number;
  className?: string;
  titleClassName?: string;
}

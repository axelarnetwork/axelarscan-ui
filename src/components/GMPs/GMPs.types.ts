// Re-export shared filter types used by GMPs.Filters
export type { FilterOption, FilterAttribute } from '@/types';

export interface GMPsProps {
  address?: string;
  useAnotherHopChain?: boolean;
}

export interface GMPSearchResults {
  [key: string]: {
    data?: GMPRowData[];
    total?: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GMPRowData = Record<string, any>;

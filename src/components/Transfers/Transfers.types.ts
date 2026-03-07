// Re-export shared filter types used by Transfers.Filters
export type { FilterOption, FilterAttribute } from '@/types';

export interface TransfersProps {
  address?: string;
}

export interface TransferSearchResults {
  [key: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: TransferRowData[];
    total?: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransferRowData = Record<string, any>;

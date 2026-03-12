import type {
  FilterAttribute,
  FilterOption,
  FilterParams,
} from '../Interchain.types';

export interface FilterInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  setParams: (params: FilterParams) => void;
}

export interface FilterSelectInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  searchInput: Record<string, string>;
  setParams: (params: FilterParams) => void;
  setSearchInput: (input: Record<string, string>) => void;
}

export interface SelectButtonContentProps {
  attribute: FilterAttribute;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  onRemoveItem: (item: FilterOption) => void;
}

export interface SelectedItemsProps {
  items: FilterOption[];
  onRemoveItem: (item: FilterOption) => void;
}

export interface SearchableInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  options: FilterOption[];
  onChange: (v: string | string[] | null) => void;
  onRemoveItem: (item: FilterOption) => void;
}

export interface SimpleInputProps {
  attribute: FilterAttribute;
  params: FilterParams;
  selectedArray: FilterOption[];
  selectedSingle: FilterOption | undefined;
  options: FilterOption[];
  onChange: (v: string | string[] | null) => void;
  onRemoveItem: (item: FilterOption) => void;
}

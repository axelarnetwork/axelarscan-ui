// ---- Filter option / attribute (canonical definitions) ----

export interface FilterOption {
  value?: string;
  title: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

// ---- Select sub-component props ----

export interface SelectFieldProps {
  attribute: FilterAttribute;
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}

export interface SearchableSelectProps extends SelectFieldProps {
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
}

export interface SelectButtonContentProps {
  attribute: FilterAttribute;
  selectedValue: FilterOption | FilterOption[] | undefined;
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
}

export interface OptionContentProps {
  selected: boolean;
  active: boolean;
  title: string;
}

// ---- FilterField props ----

export interface FilterFieldProps {
  attribute: FilterAttribute;
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
}

// ---- Options list props ----

export interface SearchableOptionsListProps {
  options: FilterOption[];
}

export interface SimpleOptionsListProps {
  options: FilterOption[];
}

// ---- FilterDialog props ----

export interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onReset: () => void;
  filtered: boolean;
  title?: string;
  attributes: FilterAttribute[];
  params: Record<string, unknown>;
  setParams: (params: Record<string, unknown>) => void;
  searchInput: Record<string, string>;
  setSearchInput: (input: Record<string, string>) => void;
}

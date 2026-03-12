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

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export interface AssetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  focusID: string | null;
  onFocus: (id: string) => void;
}

export interface ResourcesProps {
  resource?: string;
}

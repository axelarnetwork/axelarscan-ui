/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Constants ──────────────────────────────────────────────────
export const PAGE_SIZE = 25;
export const SIZE_PER_PAGE = 10;

// ─── Filters ────────────────────────────────────────────────────
export interface FiltersProps {
  address?: string;
}

export interface FilterAttribute {
  label: string;
  name: string;
  type?: 'select' | 'datetimeRange' | string;
  searchable?: boolean;
  multiple?: boolean;
  options?: FilterOption[];
}

export interface FilterOption {
  title: string;
  value?: string;
}

// ─── Transactions ───────────────────────────────────────────────
export interface TransactionsProps {
  height?: string | number;
  address?: string;
}

export interface SearchResultEntry {
  data: any[];
  total: number;
}

export type SearchResults = Record<string, SearchResultEntry>;

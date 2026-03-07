export interface PaginationProps {
  maxPage?: number;
  sizePerPage?: number;
  total: number;
}

export interface TablePaginationProps {
  data: unknown[];
  value?: number;
  maxPage?: number;
  sizePerPage?: number;
  onChange?: (page: number) => void;
}

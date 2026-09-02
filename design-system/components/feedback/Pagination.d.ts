/** Pagination: mono zero-padded counter (01 / 04) with typographic ← → ghost buttons, 44px targets, ends disabled. */
export interface PaginationProps {
  page?: number;
  pages?: number;
  onChange?: (page: number) => void;
  style?: React.CSSProperties;
}

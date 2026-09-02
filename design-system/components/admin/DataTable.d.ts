/** Admin data table: tracked-caps header, hairline row rules, court-050 hover, mono right-aligned numerics, ▲▼ typographic sort with aria-sort, Pagination, EmptyState. ≤760px: rows collapse to stacked hairline cards (title = mobileTitleKey, remaining columns as label/value lines). Carries the purchases dashboard and rosters. */
export interface DataTableProps {
  columns?: {
    key: string;
    label: string;
    /** Right-aligned mono */
    numeric?: boolean;
    /** Mono without right alignment (dates, refs) */
    mono?: boolean;
    sortable?: boolean;
    /** Custom cell, e.g. (row) => <StatusChip status={row.status}/> */
    render?: (row: any) => React.ReactNode;
  }[];
  rows?: any[];
  sort?: {key: string; dir: 'asc' | 'desc'};
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  page?: number;
  pages?: number;
  onPage?: (page: number) => void;
  /** Mono empty-state line */
  empty?: string;
  /** Column key used as the card title in the ≤760px collapse (default: first column) */
  mobileTitleKey?: string;
  onRowClick?: (row: any) => void;
  style?: React.CSSProperties;
}

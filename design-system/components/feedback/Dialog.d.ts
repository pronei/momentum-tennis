/** Modal dialog. Desktop: centered square hairline card on the court-navy 55% backdrop. ≤760px: the bottom-sheet pattern (2px ink top rule, 72vh max, safe-area padding). Focus trap, Esc, × close, body scroll lock. Confirm rule: max ONE amber action per dialog; destructive confirms use a secondary outlined button with --state-error text plus the mono `consequence` line — amber never confirms deletion. */
export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
  /** Action buttons row (right-aligned). Pass Button elements. */
  actions?: React.ReactNode;
  /** Mono uppercase consequence line in --state-error, for destructive confirms */
  consequence?: string;
  /** Desktop panel width (default 520) */
  width?: number;
  /** aria-label when there is no title */
  label?: string;
  style?: React.CSSProperties;
}

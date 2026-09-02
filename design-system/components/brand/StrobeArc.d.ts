/** Stroboscopic bounce-arc device — the brand signature. Ghost frames cool (court tints), present frame amber. Works standalone on light or field surfaces, or overlaying a photo corner. */
export interface StrobeArcProps {
  /** Number of frozen instants (default 8) */
  frames?: number;
  /** Surface it sits on: 'light' | 'field' (dark court blue) */
  tone?: 'light' | 'field';
  /** Faint dashed trajectory + ground line (default true) */
  showPath?: boolean;
  /** Mono frame labels t−n … t0 under each ball (default false) */
  annotate?: boolean;
  /** Ball radius in viewBox units (default 7) */
  ballRadius?: number;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
}

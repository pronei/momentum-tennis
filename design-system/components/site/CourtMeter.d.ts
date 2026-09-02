/** Loyalty / progression meter: the five courts ordered by difficulty (1–5). Courts climbed render cool, the current court is the warm "now" frame, courts ahead are empty. Coaches move students between courts, so the meter shifts dynamically — animate via the built-in background transition. */
export interface CourtMeterProps {
  /** Current court, 1–max (default 3) */
  court?: number;
  /** Number of courts (default 5) */
  max?: number;
  /** Tracked-caps label, default "Court level" */
  label?: string;
  /** Mono annotation right of the label, e.g. "MOVED UP · JUL 28" */
  caption?: string;
  tone?: 'light' | 'field';
  /** C1…C5 mono labels under the segments (default true) */
  showLabels?: boolean;
  style?: React.CSSProperties;
}

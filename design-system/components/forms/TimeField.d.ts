/** Time input: mono 24h value (16:00). Arrow keys step ±step minutes; ▾ opens a scrollable slot list bounded to court hours (07:00–21:00 by default). Shared form anatomy. */
export interface TimeFieldProps {
  label?: string;
  help?: string;
  error?: string;
  /** HH:MM 24h (controlled) */
  value?: string;
  defaultValue?: string;
  onChange?: (hhmm: string) => void;
  /** Arrow-key step in minutes (default 15) */
  step?: number;
  /** Slot-list step in minutes (default 30) */
  listStep?: number;
  /** Slot-list bounds, default 07:00 / 21:00 */
  from?: string;
  to?: string;
  disabled?: boolean;
  name?: string;
  style?: React.CSSProperties;
}

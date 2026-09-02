/** Date input: mono ISO value (2026-09-12) + ▾ popover month grid reusing the portal calendar pattern. Typing a full ISO date is the primary keyboard path; the grid is arrow-key navigable, Esc closes. Shared form anatomy (label / help / error). */
export interface DateFieldProps {
  label?: string;
  help?: string;
  error?: string;
  /** ISO date string YYYY-MM-DD (controlled) */
  value?: string;
  defaultValue?: string;
  /** Called with the ISO string on typing or grid pick */
  onChange?: (iso: string) => void;
  disabled?: boolean;
  name?: string;
  style?: React.CSSProperties;
}

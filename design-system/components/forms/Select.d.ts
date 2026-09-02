/** Styled native select: square, hairline, 48px, mono ▾ affordance matching the nav dropdown. Shared form anatomy (tracked-caps label / mono help / dual-channel error). */
export interface SelectProps {
  label?: string;
  help?: string;
  /** Renders "ERROR: <message>" + --state-error border; sets aria-invalid */
  error?: string;
  /** string[] or {value, label}[] */
  options?: (string | {value: string; label: string})[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: any) => void;
  /** Disabled empty first option */
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
}

/** Text input whose caret cycles: a regular ink caret bar rises, morphs into the amber tennis ball as it drops, bounces on the baseline, and re-forms into the bar on the way up. Falls back to the native caret under prefers-reduced-motion. Square, hairline-bordered, 48px tall. Carries the shared form anatomy: tracked-caps 13px label, optional mono help line, error state (--state-error border + mono "ERROR:" message wired via aria-describedby). */
export interface TextFieldProps {
  /** Tracked-caps label above the field */
  label?: string;
  /** Mono 12px help line under the field */
  help?: string;
  /** Error message — renders "ERROR: <message>" in mono + --state-error border; sets aria-invalid */
  error?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  defaultValue?: string;
  /** Controlled value (pair with onChange) */
  value?: string;
  onChange?: (e: any) => void;
  /** The bouncing-ball caret (default true; auto-disabled under reduced motion) */
  ballCaret?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

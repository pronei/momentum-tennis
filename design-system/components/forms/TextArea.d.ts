/** Multi-line text input with the shared form anatomy (tracked-caps label / mono help / dual-channel error). Square, hairline, vertical resize. Native caret — the ball caret is single-line inputs only. */
export interface TextAreaProps {
  label?: string;
  help?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
  name?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

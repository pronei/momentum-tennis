/** Mutually exclusive choice as a frame row (the ClassTimeline toggle, generalized). REPLACES circular radios (circles violate the shape law) and iOS switches — an on/off preference is a two-option SegmentedControl. Selected frame: ink border + court-050 fill. Arrow keys move selection. */
export interface SegmentedControlProps {
  label?: string;
  help?: string;
  error?: string;
  /** string[] or {value, label}[] — 2–5 short options */
  options?: (string | {value: string; label: string})[];
  value?: string;
  defaultValue?: string;
  /** Called with the option value */
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Options stretch to fill the row */
  fullWidth?: boolean;
  /** 40px frames (inside dense cards) instead of 48px */
  compact?: boolean;
  name?: string;
  style?: React.CSSProperties;
}

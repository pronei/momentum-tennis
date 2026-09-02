/** Groups form fields under an eyebrow + hairline rule, with an optional one-line description. */
export interface FormSectionProps {
  eyebrow?: string;
  /** Lead the eyebrow with FrameTicks */
  ticks?: boolean;
  description?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Action pill. Primary = amber (reserved for the one main action per view, e.g. "Book a free trial class"); secondary = outlined; ghost = bare label. */
export interface ButtonProps {
  /** 'primary' (amber — ONE per view) | 'secondary' | 'ghost' */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** 'md' 48px | 'sm' 36px (compact contexts: nav, cards) */
  size?: 'md' | 'sm';
  /** True on court-blue fields */
  onField?: boolean;
  /** Renders an <a> when set */
  href?: string;
  onClick?: (e: any) => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Frame-ticks micro-device: a row of small square "frames", cool ramp with the active frame amber. Derived from the strobe signature. Use as list marker, section divider accent, or loading state. */
export interface FrameTicksProps {
  /** Number of frames (default 5) */
  count?: number;
  /** Square edge in px (default 8) */
  size?: number;
  /** Gap in px (default 5) */
  gap?: number;
  tone?: 'light' | 'field';
  /** Which frame is "now": 'last' | 'none' | index (default 'last') */
  active?: 'last' | 'none' | number;
  /** Animates the warm frame cycling through — loading indicator */
  loading?: boolean;
  style?: React.CSSProperties;
}

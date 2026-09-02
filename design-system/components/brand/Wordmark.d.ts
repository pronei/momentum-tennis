/** The Momentum Tennis wordmark. MOMENTUM in Chivo Black; the full stop is a ball settling out of two cool ghost frames into the warm present frame. */
export interface WordmarkProps {
  /** 'lockup' = MOMENTUM + justified TENNIS line (default); 'word' = MOMENTUM alone; 'mark' = the three-ball settle alone (avatar/favicon) */
  variant?: 'lockup' | 'word' | 'mark';
  /** Cap height of MOMENTUM in px (mark: total width). Ghost frames hide below 30px. Default 44 */
  height?: number;
  /** True on court-blue fields — flips ink to line white */
  onField?: boolean;
  style?: React.CSSProperties;
}

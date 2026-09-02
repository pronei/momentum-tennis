/** Empty state: centered mono uppercase line, optional FrameTicks (all-cool, no warm frame — nothing is "now"), optional action. */
export interface EmptyStateProps {
  /** The mono message, e.g. "NO SESSIONS — COURTS REST ON WED & FRI" */
  children?: React.ReactNode;
  ticks?: boolean;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

/** One class, play by play: three equal sequential blocks (technical skill training → dynamic drills & skill application → gameplay & strategy). Weekend classes run 2h (3×40 min), weekday classes 1.5h (3×30 min) — a built-in toggle switches between them. Shows T+ offsets, never wall-clock times (those are set by the academy's admin console). Hovered block goes amber = "now". */
export interface ClassTimelineProps {
  /** Initial length: 'weekend' (2h) or 'weekday' (1.5h). Default 'weekend'. */
  variant?: 'weekend' | 'weekday';
  /** Show the weekend/weekday toggle (default true) */
  showToggle?: boolean;
  /** Override the three blocks: {title, desc?} */
  blocks?: {title: string; desc?: string}[];
  style?: React.CSSProperties;
}

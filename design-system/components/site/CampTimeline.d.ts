/** Camp-day timeline — the day rendered as a strobe sequence. Numbered frames (the one place numbers are allowed) deepen from mist to court-800 as the day advances; hovering or focusing a frame makes it the warm "now". Default items are the real 2026 camp schedule. */
export interface CampTimelineProps {
  /** Override the default (real) schedule */
  items?: { time: string; title: string; desc?: string; phase?: string }[];
  style?: React.CSSProperties;
}

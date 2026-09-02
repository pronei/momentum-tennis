/** Admin day grid: one column per court, hour rows 07:00–21:00, location SegmentedControl (DE ANZA / MURDOCK). Session blocks are square hairline cards colored by type from the cool ramp with ink text (camp 050 / class 100 / team 200 / private 300 — all AA); amber draws ONLY the current-time line. States: cancelled (dimmed, struck mono label), draft ghost frame (click an empty slot — the drag-to-create stand-in), conflict rejection (ghost turns --state-error with a mono ERROR line, e.g. COURT 2 BOOKED 16:00–17:30 — the database enforces; the UI shows the refusal). ≤760px: single-court column with a court Select. */
export interface ResourceDayViewProps {
  /** Mono date heading, e.g. "2026-09-12 · SATURDAY" */
  date?: string;
  location?: string;
  locations?: string[];
  onLocationChange?: (location: string) => void;
  courts?: {id: string; label: string; location?: string}[];
  sessions?: {id: string; court: string; location?: string; start: string; end: string; type: 'camp' | 'class' | 'team' | 'private'; title: string; coach?: string; cancelled?: boolean}[];
  /** Ghost frame; conflict message turns it into the rejection state */
  draft?: {court: string; start: string; end: string; conflict?: string};
  /** HH:MM — draws the amber now line */
  nowTime?: string;
  onSessionClick?: (session: any) => void;
  /** Click empty grid space → (courtId, "HH:MM" rounded to 30) */
  onSlotClick?: (courtId: string, start: string) => void;
  startHour?: number;
  endHour?: number;
  /** Pixels per hour (default 44) */
  rowH?: number;
  style?: React.CSSProperties;
}

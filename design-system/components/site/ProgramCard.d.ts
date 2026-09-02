/** Program card — the repeating unit across junior / camps / adult pages: eyebrow, title, level + location in mono, schedule rows, one CTA. Optional washed photo header. */
export interface ProgramCardProps {
  /** Kicker, e.g. "Juniors" */
  eyebrow: string;
  /** Program name, e.g. "Junior Team Tennis" */
  title: string;
  /** Ball-level or age range, e.g. "Orange → Yellow ball" */
  level?: string;
  /** e.g. "De Anza College" */
  location?: string;
  /** Rows of { days, time, detail? } */
  schedule?: { days: string; time: string; detail?: string }[];
  /** One short supporting sentence */
  note?: string;
  /** Photo header (path); washed by default */
  photo?: string;
  photoRatio?: '3:2' | '4:3' | '16:9' | '1:1' | '3:4' | '2:3';
  photoFocal?: string;
  photoTreatment?: 'plain' | 'wash' | 'slice';
  photoAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Amber CTA — only when this card carries the view's single main action */
  primaryCta?: boolean;
  style?: React.CSSProperties;
}

/** The photography component. Candid archive photos become analytical objects: contained, square-cornered, hairline frame, mono annotations. Handles landscape and portrait via ratio + focal. Treatments: 'plain', 'wash' (court-blue duotone), 'slice' (staggered frame slices — motion from one still; trailing slices cool, lead edge amber). */
export interface PhotoFrameProps {
  src: string;
  alt?: string;
  /** '3:2' | '4:3' | '1:1' | '16:9' | '3:4' | '2:3' — crop box; source aspect never breaks it (default '3:2') */
  ratio?: '3:2' | '4:3' | '1:1' | '16:9' | '3:4' | '2:3';
  /** CSS object-position focal point, default '50% 38%' (group shots: keep heads in upper third) */
  focal?: string;
  treatment?: 'plain' | 'wash' | 'slice';
  /** Slice count for treatment="slice" (default 5) */
  slices?: number;
  /** Mono tag overlaid top-left, e.g. "DE ANZA · SAT 09:00" */
  tag?: string;
  /** Mono caption bar below the image */
  caption?: string;
  /** Right-aligned side of the caption bar */
  captionRight?: string;
  /** Hairline border (default true) */
  frame?: boolean;
  style?: React.CSSProperties;
}

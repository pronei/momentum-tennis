/** Status as swatch + mono caps text: ACTIVE (amber swatch), UPCOMING, WAITLISTED, CANCELLED (empty frame, dim), PAID, REFUNDED, SIGNED, NEEDS RE-CONSENT (--state-error swatch), PUBLISHED, DRAFT, EXPIRED. The text always renders ink/secondary (AA at 11px — fixes the old amber ACTIVE text); the swatch alone never carries meaning. Unknown statuses render an empty frame. */
export interface StatusChipProps {
  status: string;
  tone?: 'light' | 'field';
  style?: React.CSSProperties;
}

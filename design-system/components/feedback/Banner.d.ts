/** Inline square hairline strip with a mono prefix: ERROR: (role=alert, --state-error border + text) or NOTE: (role=status, hairline). For form-level and page-level states, including the re-consent gate. */
export interface BannerProps {
  tone?: 'note' | 'error';
  /** Message after the prefix — mono uppercase */
  children?: React.ReactNode;
  /** Optional right-aligned action (Button) */
  action?: React.ReactNode;
  /** On court-navy fields */
  onField?: boolean;
  style?: React.CSSProperties;
}

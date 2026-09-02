/** The portal's tab pair extracted: desktop = tracked-caps underline row on a hairline; ≤760px = fixed bottom bar (56px + safe-area, mono labels, amber TOP border = "now") — or a horizontally scrollable top row via mobileMode="scroll" for admin-density tab sets (6+). */
export interface TabsProps {
  /** string[] or {id, label}[] */
  items?: (string | {id: string; label: string})[];
  /** id of the current tab */
  active?: string;
  onChange?: (id: string) => void;
  /** ≤760px behavior: 'bottom' bar (default) or 'scroll' top row */
  mobileMode?: 'bottom' | 'scroll';
  ariaLabel?: string;
  style?: React.CSSProperties;
}

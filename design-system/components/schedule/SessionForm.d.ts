/** Session create/edit form composed from the form system: type SegmentedControl, court + coach Selects, DateField, start/end TimeFields, notes TextArea. The conflict prop renders the inline rejection (error Banner + disabled submit) — the database enforces conflicts; the form shows the refusal. Amber appears once: the submit. */
export interface SessionFormProps {
  /** Initial values: {type, court, coach, date, start, end, notes} */
  value?: any;
  courts?: {id: string; label: string}[];
  coaches?: string[];
  /** Mono conflict message, e.g. "COURT 2 BOOKED 16:00–17:30 — PICK ANOTHER SLOT" */
  conflict?: string;
  onSubmit?: (value: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  style?: React.CSSProperties;
}

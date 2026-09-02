/** Checkbox as a frame that fills: hairline square, solid ink fill when checked (attendance-strip precedent — fill-state carries the meaning, not color). consent variant enlarges the frame and sets body-copy label sizing for waiver signing. 44px minimum target. */
export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: any) => void;
  disabled?: boolean;
  /** Large 28px frame + body label — waiver/consent rows */
  consent?: boolean;
  /** Renders "ERROR: <message>" + --state-error frame border */
  error?: string;
  name?: string;
  style?: React.CSSProperties;
}

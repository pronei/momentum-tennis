/** Bottom toast: square ink strip, mono uppercase message, auto-dismiss (default 4s), optional × dismiss. Entry settle collapses to instant under reduced motion. role=status. For confirmations use the existing vocabulary: "MARKED · 8 / 10", "SAVED · 16:04". */
export interface ToastProps {
  open: boolean;
  children?: React.ReactNode;
  onDismiss?: () => void;
  /** ms; 0 disables auto-dismiss */
  duration?: number;
  style?: React.CSSProperties;
}

/** CourtMeter generalized to N configurable dimensions. Each row: caps label (+ optional mono INTERNAL tag for coach-only dimensions), 5 segments (climbed cool ramp / current amber / ahead empty frames), always-visible mono value "3 OF 5" (the accessibility guarantee — never color alone), optional trend ("+1 · JUL 28") and mono history note. Display rows carry role="meter" with aria-valuenow/-valuemax; interactive mode renders 44px tap-target segment buttons for coach rating entry. */
export interface RatingMeterProps {
  dimensions?: {
    label: string;
    /** 0–max */
    value: number;
    /** Coach-only dimension — renders the INTERNAL tag */
    internal?: boolean;
    /** Mono trend annotation, e.g. "+1 · JUL 28" */
    trend?: string;
    /** Mono history line under the segments */
    note?: string;
  }[];
  /** Segments per row (default 5) */
  max?: number;
  tone?: 'light' | 'field';
  /** Segments become input buttons */
  interactive?: boolean;
  /** (dimensionIndex, value 1–max) */
  onChange?: (dimensionIndex: number, value: number) => void;
  style?: React.CSSProperties;
}

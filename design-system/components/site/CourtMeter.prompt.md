CourtMeter — the portal's loyalty/progression meter: 5 horizontal segments = the 5 courts by difficulty; current court is amber ("now"), climbed courts cool, remaining courts empty frames.

```jsx
<CourtMeter court={3} caption="Moved up · Jul 28" />
<CourtMeter court={5} label="Court placement" tone="field" />
```

Uses the past-cool/now-warm law — never recolor segments. Numbers here are data (mono), not decorative markers.

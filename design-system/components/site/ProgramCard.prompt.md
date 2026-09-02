Program card — one per program (Junior, Camps, Adult); grid of three on the homepage, single column on program pages.

```jsx
<ProgramCard eyebrow="Juniors" title="Junior Team Tennis" level="Orange → Yellow ball"
  location="De Anza College · Murdock Park"
  schedule={[{days:'Sat & Sun',time:'09:00–11:00'},{days:'Mon · Tue · Thu',time:'16:00–20:00'}]}
  note="USTA Junior Team Tennis — matches against Bay Area clubs."
  photo="assets/photos/net-rally-l.jpg" ctaLabel="View schedule" ctaHref="#junior" />
```

Keep schedules verbatim from the real timetable. `primaryCta` on at most one card per view.

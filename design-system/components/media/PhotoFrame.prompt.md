PhotoFrame — every photo goes through it; never place a raw `<img>` or a full-bleed background photo.

```jsx
<PhotoFrame src="assets/photos/net-rally-l.jpg" ratio="3:2" treatment="slice"
  tag="MURDOCK PARK" caption="Green ball — rallies &amp; games" captionRight="THU 17:00" />
<PhotoFrame src="assets/photos/medal-shirt-p.jpg" ratio="3:4" treatment="wash" />
```

- Mixed aspect sources are guaranteed: pick the `ratio` the layout needs, aim `focal` at the gesture.
- `slice` = the strobe made photographic (one still, staggered frames); use once per view, on motion-adjacent shots.
- `wash` for backgrounds/mood rows; `plain` for proof shots that should read as documentation.
- Prefer crops of motion and effort (hands, swings, backs, huddles) over identifiable faces of minors.

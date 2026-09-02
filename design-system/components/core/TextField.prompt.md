TextField — every text input in the system; the caret replaces the blink with a cycle: ink bar rises → becomes the amber ball on the way down → bounces → re-forms as the bar. Carries the shared form anatomy (label / help / error).

```jsx
<TextField label="Player name" placeholder="Full name" />
<TextField label="Email" type="email" help="WE ONLY EMAIL SCHEDULE CHANGES" />
<TextField label="Phone" error="enter a 10-digit number" />
```

Square, hairline, 48px. Errors are dual-channel (border + mono ERROR: line) and announce via aria-describedby. Reduced-motion users get the native caret. Inputs only — never textareas.

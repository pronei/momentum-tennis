ClassTimeline — the homepage's "play by play of your time on court": three equal class blocks with numbered frames (the one place numbered markers are allowed besides the camp day), a weekend 2h / weekday 1.5h toggle, and T+ offsets instead of wall-clock times (times are admin-set).

```jsx
<ClassTimeline/>                       {/* toggle included */}
<ClassTimeline variant="weekday" showToggle={false}/>
```

Put it in a white card on the court-navy field section. Don't add wall-clock times — the admin console owns those.

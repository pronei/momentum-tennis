ResourceDayView — the admin schedule editor's canvas. Courts as columns, sessions as cool-ramp blocks, amber only for NOW.

```jsx
<ResourceDayView date="2026-09-12 · SATURDAY" nowTime="16:20"
  courts={[{id:'c1',label:'COURT 1',location:'DE ANZA'},{id:'c2',label:'COURT 2',location:'DE ANZA'}]}
  sessions={[{id:1,court:'c1',start:'16:00',end:'17:30',type:'class',title:'Green ball',coach:'VISHAL'}]}
  draft={{court:'c2',start:'16:00',end:'17:30',conflict:'COURT 2 BOOKED 16:00–17:30'}}
  onSlotClick={(court,start)=>setDraft({court,start,end:plus90(start)})} onSessionClick={openForm} />
```

Production adds real drag; onSlotClick is the click stand-in. Never recolor session types outside the four cool-ramp steps.

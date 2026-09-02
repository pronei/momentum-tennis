SessionForm — the schedule editor's create/edit form, usually inside a Dialog. Conflict = error Banner + disabled save.

```jsx
<Dialog open={open} onClose={close} title="New session">
  <SessionForm courts={courts} coaches={['Artur','Vishal','Elsio']}
    conflict={overlap?'COURT 2 BOOKED 16:00–17:30 — PICK ANOTHER SLOT':undefined}
    onSubmit={save} onCancel={close} />
</Dialog>
```

Dialog — the one modal. Centered square card on desktop, the existing bottom sheet under 760px.

```jsx
<Dialog open={open} onClose={close} title="Cancel session"
  consequence="CANCELLING NOTIFIES 6 BOOKED FAMILIES"
  actions={<><Button variant="ghost" onClick={close}>Keep session</Button>
  <Button variant="secondary" style={{color:'var(--state-error)',borderColor:'var(--state-error)'}} onClick={confirm}>Cancel session</Button></>}>
  <p>…</p>
</Dialog>
```

One amber action max; destructive = secondary outline + error text + consequence — never amber.

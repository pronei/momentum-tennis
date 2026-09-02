Tabs — one component for the portal/admin section switcher. Desktop underline row; mobile bottom bar (amber top border = now). Admin's 7 tabs use mobileMode="scroll".

```jsx
<Tabs items={[{id:'stats',label:'Stats'},{id:'cal',label:'Calendar'}]} active={tab} onChange={setTab} />
```

Reserve the bottom bar for the page's ONE primary section switcher — never nest.

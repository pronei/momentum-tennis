SegmentedControl — every mutually exclusive pick with ≤5 short options: class type, visibility, on/off preferences. This IS the system's radio button and its switch; never draw circles or iOS toggles.

```jsx
<SegmentedControl label="Class length" options={[{value:'we',label:'Weekend · 2h'},{value:'wd',label:'Weekday · 1.5h'}]} defaultValue="we" />
<SegmentedControl label="Visibility" options={['Visible to family','Internal']} fullWidth />
```

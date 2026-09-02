RatingMeter — coach ratings on the CourtMeter pattern: past cool, current amber, ahead empty. One row per dimension; the mono "N OF 5" always shows.

```jsx
<RatingMeter dimensions={[
  {label:'Technique',value:3,trend:'+1 · JUL 28'},
  {label:'Footwork',value:2,note:'2 OF 5 · SINCE JUN 14'},
  {label:'Attitude',value:4,internal:true},
]} />
<RatingMeter interactive onChange={(dim,v)=>save(dim,v)} dimensions={dims} />
```

Never recolor segments; INTERNAL rows never render in family-facing views.

DataTable — purchases, rosters, waiver lists. Sorting/paging are controlled (pass sort/onSort, page/pages/onPage).

```jsx
<DataTable columns={[
  {key:'order',label:'Order',mono:true,sortable:true},
  {key:'guardian',label:'Guardian'},
  {key:'total',label:'Total',numeric:true,sortable:true},
  {key:'status',label:'Status',render:r=><StatusChip status={r.status}/>},
]} rows={rows} sort={sort} onSort={setSortKV} page={1} pages={3} onPage={setPage} onRowClick={openOrder} />
```

Numbers right-aligned mono; statuses always via StatusChip; keep row height at one line.

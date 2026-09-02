const NS=window.MomentumTennisDesignSystem_0ea6ac||{};
const {Wordmark,Eyebrow,Button,Tabs,DataTable,StatusChip,Dialog,Banner,ResourceDayView,SessionForm,EmptyState}=NS;
const mono=(s=13,c)=>({fontFamily:'var(--font-mono)',fontSize:s/16+'rem',lineHeight:1.5,letterSpacing:'0.05em',textTransform:'uppercase',color:c||'var(--text-secondary)'});
const lbl={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--text-secondary)'};
const card={background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'};
const container={maxWidth:'var(--container)',margin:'0 auto'};
function useMobile(){
  const [m,setM]=React.useState(()=>window.matchMedia('(max-width:760px)').matches);
  React.useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}

// —— SAMPLE DATA (prototype only) ——
const COURTS=[{id:'c1',label:'COURT 1',location:'DE ANZA'},{id:'c2',label:'COURT 2',location:'DE ANZA'},{id:'c3',label:'COURT 3',location:'DE ANZA'},{id:'c4',label:'COURT 4',location:'DE ANZA'},{id:'m1',label:'COURT 1',location:'MURDOCK'},{id:'m2',label:'COURT 2',location:'MURDOCK'}];
const COACHES=['Artur Westergren','Vishal','Elsio'];
const SESSIONS=[
  {id:1,court:'c1',location:'DE ANZA',start:'09:00',end:'11:00',type:'class',title:'Junior classes — all levels',coach:'VISHAL'},
  {id:2,court:'c2',location:'DE ANZA',start:'09:00',end:'11:00',type:'class',title:'Yellow ball int.+',coach:'ELSIO'},
  {id:3,court:'c3',location:'DE ANZA',start:'09:00',end:'10:30',type:'private',title:'Private — M. Chen',coach:'ARTUR'},
  {id:4,court:'c1',location:'DE ANZA',start:'11:00',end:'13:00',type:'class',title:'Adult clinic',coach:'ARTUR'},
  {id:5,court:'c2',location:'DE ANZA',start:'11:30',end:'13:00',type:'team',title:'JTT practice',coach:'ELSIO'},
  {id:6,court:'c4',location:'DE ANZA',start:'10:00',end:'12:00',type:'class',title:'Orange ball',coach:'VISHAL',cancelled:true},
  {id:7,court:'c3',location:'DE ANZA',start:'14:00',end:'15:00',type:'private',title:'Private — D. Park',coach:'ARTUR'},
  {id:8,court:'m1',location:'MURDOCK',start:'16:00',end:'17:00',type:'class',title:'Orange ball',coach:'VISHAL'},
  {id:9,court:'m1',location:'MURDOCK',start:'17:00',end:'18:30',type:'class',title:'Green ball',coach:'VISHAL'},
  {id:10,court:'m2',location:'MURDOCK',start:'17:00',end:'18:30',type:'private',title:'Private — R. Iyer',coach:'ARTUR'},
];
const overlaps=(a,b)=>a.court===b.court&&a.start<b.end&&b.start<a.end;
const ORDERS=[
  {order:'M-1042',date:'2026-08-21',guardian:'Priya R.',items:'Junior classes · 8 pack',total:'$360.00',status:'PAID',ledger:['8 CREDITS ISSUED · MAYA R. · EXPIRES 2027-03-01','STRIPE REF PI_3NXK2QLKDZ9DQ2'],email:'priya@example.com'},
  {order:'M-1041',date:'2026-08-20',guardian:'Wei Z.',items:'Adult clinic · 4 pack',total:'$220.00',status:'PAID',ledger:['4 CREDITS ISSUED · WEI Z. · EXPIRES 2027-02-20','STRIPE REF PI_3NXH8ALKDZ1MB7'],email:'wei@example.com'},
  {order:'M-1040',date:'2026-08-19',guardian:'Sofia M.',items:'Summer camp · half week',total:'$315.00',status:'PAID',ledger:['CAMP WEEK 10 · HALF DAY · LEO M.','STRIPE REF PI_3NXF2WLKDZ4KT1'],email:'sofia@example.com'},
  {order:'M-1039',date:'2026-08-18',guardian:'Dana K.',items:'Summer camp · full week',total:'$495.00',status:'REFUNDED',ledger:['CAMP WEEK 9 · FULL DAY · SAM K.','REFUNDED 2026-08-20 · $495.00 · 0 CREDITS REVOKED','STRIPE REF PI_3NXD9KLKDZ7PW4'],email:'dana@example.com'},
  {order:'M-1038',date:'2026-08-17',guardian:'Amir S.',items:'Junior classes · 8 pack',total:'$360.00',status:'PAID',ledger:['8 CREDITS ISSUED · ZARA S. · EXPIRES 2027-02-17','STRIPE REF PI_3NXB4RLKDZ2QX8'],email:'amir@example.com'},
];

function ScheduleTab(){
  const m=useMobile();
  const [loc,setLoc]=React.useState('DE ANZA');
  const [draft,setDraft]=React.useState(null);
  const [editing,setEditing]=React.useState(null);
  const plus90=(t)=>{const[hh,mm]=t.split(':').map(Number);const x=hh*60+mm+90;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0');};
  const slotClick=(court,start)=>{
    const d={court,start,end:plus90(start)};
    const hit=SESSIONS.find(s=>!s.cancelled&&s.location===loc&&overlaps(d,{...d,court:s.court===court?court:'x'})&&s.court===court&&s.start<d.end&&d.start<s.end);
    setDraft(hit?{...d,conflict:COURTS.find(c=>c.id===court).label+' BOOKED '+hit.start+'\u2013'+hit.end+' \u2014 PICK ANOTHER SLOT'}:d);
  };
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <Banner>Click an empty slot to place a session — the ghost frame; drops onto a booked slot show the database's refusal. Drag arrives in production.</Banner>
    <div style={{...card,padding:m?'14px 12px':card.padding}}>
      <ResourceDayView date="2026-09-12 · SATURDAY" location={loc} onLocationChange={(v)=>{setLoc(v);setDraft(null);}}
        courts={COURTS} sessions={SESSIONS} draft={draft} nowTime="10:40"
        onSessionClick={(s)=>setEditing(s)} onSlotClick={slotClick}/>
    </div>
    {draft&&!draft.conflict&&<div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
      <Button variant="ghost" size="sm" onClick={()=>setDraft(null)}>Discard</Button>
      <Button variant="secondary" size="sm" onClick={()=>setEditing({court:draft.court,start:draft.start,end:draft.end,type:'class'})}>Detail &amp; save</Button>
    </div>}
    <Dialog open={!!editing} onClose={()=>setEditing(null)} title={editing&&editing.id?'Edit session':'New session'}>
      {editing&&<SessionForm value={{type:editing.type,court:editing.court,coach:COACHES[0],date:'2026-09-12',start:editing.start,end:editing.end,notes:''}}
        courts={COURTS.filter(c=>c.location===loc)} coaches={COACHES}
        onSubmit={()=>{setEditing(null);setDraft(null);}} onCancel={()=>setEditing(null)}/>}
    </Dialog>
  </div>;
}

function ProgramsTab(){
  return <div style={{display:'flex',flexDirection:'column',gap:24,maxWidth:900}}>
    <div style={card}>
      <div style={{...lbl,marginBottom:8}}>Programs</div>
      <DataTable columns={[
        {key:'name',label:'Program'},
        {key:'loc',label:'Locations'},
        {key:'cadence',label:'Cadence',mono:true},
        {key:'status',label:'Status',render:r=><StatusChip status={r.status}/>},
      ]} rows={[
        {name:'Classes',loc:'De Anza · Murdock',cadence:'SAT+SUN 2H · MON/TUE/THU 1.5H',status:'ACTIVE'},
        {name:'Team tennis (USTA JTT)',loc:'Bay Area league',cadence:'FALL + SPRING',status:'ACTIVE'},
        {name:'Private lessons',loc:'De Anza · Murdock',cadence:'BY APPOINTMENT',status:'ACTIVE'},
        {name:'Summer camps',loc:'De Anza',cadence:'JUN W2 \u2013 JUL END',status:'UPCOMING'},
      ]}/>
    </div>
    <div style={card}>
      <div style={{...lbl,marginBottom:8}}>Seasonal events</div>
      {[['Summer camps 2027','2027-06-07 \u2192 2027-07-30','RETURNS 2027'],['Summer camps 2026','2026-06-08 \u2192 2026-07-31','ENDED']].map((e,i)=>
        <div key={i} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'10px 0',borderBottom:'var(--hairline)',alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:600,color:'var(--ink)'}}>{e[0]}</span>
          <span style={mono(12)}>{e[1]} · {e[2]}</span>
        </div>)}
      <p style={{...mono(11),marginTop:12,marginBottom:0}}>THE HOMEPAGE CAMP BANNER AND NAV NOTE DERIVE FROM THESE WINDOWS — SEE PRODUCT.MD §12.</p>
    </div>
  </div>;
}

function PurchasesTab(){
  const m=useMobile();
  const [sort,setSort]=React.useState({key:'date',dir:'desc'});
  const [sel,setSel]=React.useState(null);
  const [confirmRefund,setConfirmRefund]=React.useState(false);
  const dir=sort.dir==='asc'?1:-1;
  const rows=[...ORDERS].sort((a,b)=>a[sort.key]<b[sort.key]?-dir:dir);
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
      <span style={mono(12)}>AUG 2026 · 5 ORDERS · $1,750.00 GROSS · $495.00 REFUNDED</span>
      <span style={mono(12)}>STRIPE · SAMPLE DATA</span>
    </div>
    <div style={{...card,padding:m?0:'8px 16px 12px',border:m?'none':card.border,background:m?'transparent':card.background}}>
      <DataTable columns={[
        {key:'order',label:'Order',mono:true,sortable:true},
        {key:'date',label:'Date',mono:true,sortable:true},
        {key:'guardian',label:'Guardian'},
        {key:'items',label:'Items'},
        {key:'total',label:'Total',numeric:true,sortable:true},
        {key:'status',label:'Status',render:r=><StatusChip status={r.status}/>},
      ]} rows={rows} sort={sort} onSort={(key,d)=>setSort({key,dir:d})} page={1} pages={1}
        onRowClick={(r)=>{setSel(r);setConfirmRefund(false);}} empty="NO ORDERS THIS PERIOD"/>
    </div>
    <Dialog open={!!sel} onClose={()=>setSel(null)} title={sel?'Order '+sel.order:''}
      consequence={confirmRefund?'REFUNDING RETURNS '+(sel?sel.total:'')+' AND REVOKES UNUSED CREDITS — THIS CANNOT BE UNDONE':undefined}
      actions={sel&&sel.status==='PAID'?(confirmRefund?
        <React.Fragment><Button variant="ghost" onClick={()=>setConfirmRefund(false)}>Keep order</Button>
        <Button variant="secondary" style={{color:'var(--state-error)',borderColor:'var(--state-error)'}} onClick={()=>setSel(null)}>Refund {sel.total}</Button></React.Fragment>
        :<Button variant="secondary" size="sm" onClick={()=>setConfirmRefund(true)}>Refund order</Button>):null}>
      {sel&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:16}}><span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:600,color:'var(--ink)'}}>{sel.items}</span><span style={mono(13,'var(--ink)')}>{sel.total}</span></div>
        <div style={mono(12)}>{sel.guardian.toUpperCase()} · {sel.email.toUpperCase()} · {sel.date}</div>
        <div style={{borderTop:'var(--hairline)',paddingTop:10,display:'flex',flexDirection:'column',gap:6}}>
          <span style={lbl}>Ledger</span>
          {sel.ledger.map((l,i)=><span key={i} style={mono(12)}>{l}</span>)}
        </div>
      </div>}
    </Dialog>
  </div>;
}

function AdminApp(){
  const m=useMobile();
  const P=window.MTAdminParts||{};
  const TAB_ITEMS=[{id:'schedule',label:'Schedule'},{id:'programs',label:'Programs'},{id:'purchases',label:'Purchases'},{id:'players',label:'Players'},{id:'waivers',label:'Waivers'},{id:'ratings',label:'Ratings'},{id:'settings',label:'Settings'}];
  const initial=TAB_ITEMS.findIndex(t=>t.id===(location.hash||'').replace('#',''));
  const [tab,setTab]=React.useState(initial>=0?TAB_ITEMS[initial].id:'schedule');
  const go=(id)=>{setTab(id);location.hash=id;};
  return <div style={{background:'var(--surface-page)',minHeight:'100vh'}}>
    <header style={{position:'sticky',top:0,zIndex:20,background:'rgba(247,247,247,0.94)',backdropFilter:'blur(6px)',borderBottom:'var(--hairline)'}}>
      <div style={{...container,padding:m?'0 16px':'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',height:64}}>
        <a href="../website/index.html" aria-label="Momentum Tennis home" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10}}>
          <img src="../../assets/logo-mark.svg" alt="" style={{height:36,display:'block'}}/>
          {Wordmark&&<Wordmark variant="word" height={16}/>}
        </a>
        <span style={mono(12)}>ADMIN · ARTUR W. · SAMPLE DATA</span>
      </div>
    </header>
    <div style={{...container,padding:m?'24px 16px 12px':'36px 32px 24px'}} data-screen-label="Admin header">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
        <div>
          {Eyebrow&&<Eyebrow ticks>Admin console</Eyebrow>}
          <h1 style={{margin:'12px 0 0',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h2)',lineHeight:1.02,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Momentum Tennis</h1>
        </div>
        <span style={mono(12)}>SAT 2026-09-12 · DE ANZA + MURDOCK</span>
      </div>
      <div style={{marginTop:24}}>
        {Tabs&&<Tabs items={TAB_ITEMS} active={tab} onChange={go} mobileMode="scroll" ariaLabel="Admin sections"/>}
      </div>
    </div>
    <main style={{...container,padding:m?'0 16px 96px':'0 32px 96px'}} data-screen-label={tab}>
      {tab==='schedule'&&<ScheduleTab/>}
      {tab==='programs'&&<ProgramsTab/>}
      {tab==='purchases'&&<PurchasesTab/>}
      {tab==='players'&&P.PlayersTab&&<P.PlayersTab/>}
      {tab==='waivers'&&P.WaiversAdminTab&&<P.WaiversAdminTab/>}
      {tab==='ratings'&&P.RatingsTab&&<P.RatingsTab/>}
      {tab==='settings'&&P.SettingsTab&&<P.SettingsTab/>}
    </main>
  </div>;
}
Object.assign(window,{MTAdmin:{AdminApp}});

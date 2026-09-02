const NS=window.MomentumTennisDesignSystem_0ea6ac||{};
const {SiteNav,Wordmark,FrameTicks,Button,Eyebrow,CourtMeter,TextField}=NS;
const mono=(s=13)=>({fontFamily:'var(--font-mono)',fontSize:s/16+'rem',lineHeight:1.5,color:'var(--text-secondary)'});
const lbl={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--text-secondary)'};
const h3={margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h3)',lineHeight:1.05,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'};
const card={background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'};
const container={maxWidth:'var(--container)',margin:'0 auto',padding:'0 32px'};
const TABS=['Stats','Calendar','Bookings','Store','Profile'];

// —— sample data (prototype only) ——
const SHOTS=[{k:'Forehand',n:142,peak:0.86},{k:'Backhand',n:98,peak:0.71},{k:'Serve',n:36,peak:0.93},{k:'Volley',n:22,peak:0.54}];
const LEADERS=[['1','K. T.',1240],['2','M. R.',1185],['3','A. S.',1120],['4','J. L.',1050],['5','D. P.',980]];
const ATTEND=[1,1,1,0,1,1,1,1,0,1];
const PAYMENTS=[{item:'Summer camp — Week 6 (full day)',amt:'$495',status:'PAID · JUL 10'},{item:'Junior classes — 8-session pack',amt:'$360',status:'PAID · JUN 02'}];
const BOOKINGS=[{title:'Junior classes & teams',detail:'Green ball · Murdock Park',sched:'Mon · Tue · Thu 17:00–18:30',left:'5 of 8 sessions left',status:'ACTIVE'},{title:'Summer camp — Week 10',detail:'12U · De Anza College',sched:'Aug 11–15 · 09:00–17:00',left:'Full day',status:'UPCOMING'}];
const PACKAGES=[{name:'Junior classes · 8 pack',price:'$360',member:'$324',detail:'Any ball level · Murdock or De Anza'},{name:'Summer camp · full week',price:'$495',member:'$445',detail:'09:00–17:00 · tennis + studios'},{name:'Summer camp · half week',price:'$315',member:'$283',detail:'09:00–13:00 · tennis mornings'},{name:'Adult clinic · 4 pack',price:'$220',member:'$198',detail:'Weekend mornings · De Anza'}];
const daySlots=(d)=>{const dow=new Date(2026,7,d).getDay();
  if(dow===0||dow===6)return[{t:'09:00–11:00',p:'Junior classes — all ball levels',loc:'DE ANZA',spots:d%3+1},{t:'11:00–13:00',p:'Yellow ball int. & advanced',loc:'DE ANZA',spots:d%2},{t:'09:00–11:00',p:'Adult clinic',loc:'DE ANZA',spots:2}];
  if(dow===1||dow===2||dow===4)return[{t:'16:00–17:00',p:'Orange ball',loc:'MURDOCK',spots:d%4},{t:'17:00–18:30',p:'Green ball',loc:'MURDOCK',spots:(d+1)%3},{t:'18:30–20:00',p:'Yellow ball',loc:'MURDOCK',spots:2}];
  return[];};

function StatsTab(){
  return <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:24,alignItems:'start'}}>
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div style={card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16}}>
          <h3 style={h3}>Session — Aug 6</h3>
          <span style={mono(12)}>GRIP SENSOR · IMU + PRESSURE · SYNCED 09:42</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,borderTop:'var(--hairline)',paddingTop:16}}>
          {SHOTS.map(s=><div key={s.k}>
            <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2.25rem',lineHeight:1,color:'var(--ink)'}}>{s.n}</div>
            <div style={{...lbl,marginTop:6}}>{s.k}</div>
            <div style={{height:6,background:'var(--court-050)',marginTop:10,position:'relative'}}><div style={{position:'absolute',inset:'0 auto 0 0',width:s.peak*100+'%',background:'var(--court-400)'}}></div></div>
            <div style={{...mono(11),marginTop:4}}>PEAK GRIP {Math.round(s.peak*100)}%</div>
          </div>)}
        </div>
        <p style={{...mono(12),marginTop:16,marginBottom:0}}>298 SHOTS CLASSIFIED · RALLY AVG 6.2 · LONGEST RALLY 19 · SWING SPEED P95 61 MPH</p>
      </div>
      <div style={card}>
        <div style={{...lbl,marginBottom:12}}>Attendance — last 10 sessions</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {ATTEND.map((a,i)=><span key={i} style={{width:18,height:18,background:a?'var(--court-400)':'transparent',border:a?'1px solid transparent':'var(--hairline)',boxSizing:'border-box'}}></span>)}
          <span style={{...mono(12),marginLeft:12}}>8 / 10 · 80%</span>
        </div>
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div style={card}>{CourtMeter&&<CourtMeter court={3} caption="MOVED UP · JUL 28" label="Court placement"/>}
        <p style={{...mono(12),marginTop:14,marginBottom:0}}>COURTS ORDERED BY DIFFICULTY 1–5. COACHES MOVE PLAYERS BETWEEN COURTS DURING THE SEASON — THE METER FOLLOWS.</p>
      </div>
      <div style={card}>
        <div style={{...lbl,marginBottom:10}}>Leaderboard — Green group</div>
        {LEADERS.map(r=><div key={r[0]} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'8px 0',borderBottom:'var(--hairline)',alignItems:'baseline'}}>
          <span style={mono(12)}>{r[0].padStart(2,'0')}</span>
          <span style={{flex:1,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:r[1]==='M. R.'?600:400,color:'var(--ink)'}}>{r[1]}{r[1]==='M. R.'&&' — Maya'}</span>
          <span style={mono(12)}>{r[2]} PTS</span>
        </div>)}
      </div>
      <div style={card}>
        <div style={{...lbl,marginBottom:10}}>Payments</div>
        {PAYMENTS.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'8px 0',borderBottom:'var(--hairline)'}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',color:'var(--ink)'}}>{p.item}</span>
          <span style={{...mono(12),whiteSpace:'nowrap'}}>{p.amt} · {p.status}</span>
        </div>)}
        <div style={{...mono(12),marginTop:10}}>NEXT: FALL JUNIORS PACKAGE — DUE SEP 1</div>
      </div>
    </div>
  </div>;
}

function CalendarTab(){
  const [sel,setSel]=React.useState(8);
  const first=new Date(2026,7,1).getDay(); // 6 = Sat
  const cells=[...Array(first).fill(null),...Array.from({length:31},(_,i)=>i+1)];
  const slots=daySlots(sel);
  return <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:24,alignItems:'start'}}>
    <div style={card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14}}><h3 style={h3}>August 2026</h3><span style={mono(12)}>DE ANZA + MURDOCK</span></div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=><div key={d} style={{...mono(10.5),textAlign:'center',padding:'4px 0'}}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d)return <div key={'e'+i}></div>;
          const n=daySlots(d).length;const open=daySlots(d).reduce((a,s)=>a+s.spots,0);
          const active=sel===d;
          return <button key={d} onClick={()=>setSel(d)} style={{aspectRatio:'1/0.82',border:active?'1px solid var(--ink)':'var(--hairline)',background:n?(active?'var(--court-050)':'var(--white)'):'var(--surface-page)',cursor:n?'pointer':'default',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'6px 7px',borderRadius:0}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:n?'var(--ink)':'var(--text-secondary)',textAlign:'left'}}>{d}</span>
            {n>0&&<span style={{display:'flex',gap:3}}>{Array.from({length:n},(_,j)=><span key={j} style={{width:6,height:6,background:open?'var(--court-400)':'var(--court-200)'}}></span>)}</span>}
          </button>;})}
      </div>
      <div style={{...mono(11),marginTop:10}}>■ = A SESSION RUNS THAT DAY · CLICK A DAY FOR SLOTS</div>
    </div>
    <div style={card}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}><h3 style={{...h3,fontSize:'1.375rem'}}>Aug {sel}</h3><span style={mono(12)}>{new Date(2026,7,sel).toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}</span></div>
      {slots.length===0&&<p style={{...mono(12),margin:'12px 0 0'}}>NO SESSIONS — COURTS REST ON WED &amp; FRI.</p>}
      {slots.map((s,i)=><div key={i} style={{padding:'14px 0',borderTop:i?'var(--hairline)':'none',display:'flex',flexDirection:'column',gap:4}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12}}><span style={{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--court-500)'}}>{s.t}</span><span style={mono(11)}>{s.loc}</span></div>
        <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body-sm)',color:'var(--ink)'}}>{s.p}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <span style={mono(11)}>{s.spots>0?s.spots+' SPOTS OPEN':'WAITLIST'}</span>
          {Button&&<Button variant="secondary" size="sm" href="#book">{s.spots>0?'Book':'Join waitlist'}</Button>}
        </div>
      </div>)}
    </div>
  </div>;
}

function BookingsTab(){
  return <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:760}}>
    {BOOKINGS.map((b,i)=><div key={i} style={{...card,display:'grid',gridTemplateColumns:'1fr auto',gap:'4px 24px'}}>
      <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>{b.title}</div>
      <span style={{...mono(11),textAlign:'right',color:b.status==='ACTIVE'?'var(--accent-present-hover)':'var(--text-secondary)'}}>{b.status}</span>
      <div style={mono(12)}>{b.detail.toUpperCase()} · {b.sched.toUpperCase()}</div>
      <span style={{...mono(12),textAlign:'right'}}>{b.left.toUpperCase()}</span>
    </div>)}
    <p style={{...mono(12),margin:0}}>RESCHEDULES FOLLOW THE CANCELATION POLICY — 24H NOTICE.</p>
  </div>;
}

function StoreTab(){
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
      {PACKAGES.map((p,i)=><div key={i} style={{...card,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>{p.name}</div>
        <div style={mono(12)}>{p.detail.toUpperCase()}</div>
        <div style={{marginTop:'auto',display:'flex',flexDirection:'column',gap:2}}>
          <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.75rem',color:'var(--ink)'}}>{p.price}</span>
          <span style={{...mono(11),color:'var(--court-500)'}}>MEMBER {p.member}</span>
        </div>
        {Button&&<Button variant="secondary" size="sm" href="#checkout">Add to cart</Button>}
      </div>)}
    </div>
    <p style={{...mono(12),marginTop:16,marginBottom:0}}>MEMBER PRICING SHOWS WHEN A PARENT IS LOGGED IN · CHECKOUT + PAYMENT GATEWAY: SEE PRODUCT.MD</p>
  </div>;
}

function ProfileTab(){
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,maxWidth:860,alignItems:'start'}}>
    <div style={{...card,display:'flex',flexDirection:'column',gap:16}}>
      <div style={lbl}>Parent — account owner</div>
      {TextField&&<TextField label="Name" defaultValue="Priya R."/>}
      {TextField&&<TextField label="Email" type="email" defaultValue="priya@example.com"/>}
      {TextField&&<TextField label="Phone" type="tel" defaultValue="669-264-0000"/>}
      {Button&&<div><Button variant="secondary" size="sm">Save changes</Button></div>}
    </div>
    <div style={{...card,display:'flex',flexDirection:'column',gap:12}}>
      <div style={lbl}>Linked player</div>
      <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>Maya R. — Green group</div>
      <div style={mono(12)}>CHILD LOGIN: ENABLED · SHARES THIS ACCOUNT</div>
      <div style={mono(12)}>SEES: STATS · LEADERBOARD · CALENDAR<br/>HIDDEN: PAYMENTS · STORE CHECKOUT</div>
      {Button&&<div><Button variant="ghost" size="sm">Manage child access</Button></div>}
    </div>
  </div>;
}

function Portal(){
  const initial=TABS.map(t=>t.toLowerCase()).indexOf((location.hash||'').replace('#',''));
  const [tab,setTab]=React.useState(initial>=0?initial:0);
  return <div style={{background:'var(--surface-page)',minHeight:'100vh'}}>
    {SiteNav&&<SiteNav active={tab===1?'calendar':tab===3?'store':'account'} loggedIn links={{home:'#',juniors:'#programs',camps:'#camp-day',adults:'#programs',jtt:'#proof',calendar:'#calendar',store:'#store',login:'#profile',book:'#book',logoSrc:window.__resources.logoMark}}/>}
    <div style={{...container,padding:'40px 32px 32px'}} data-screen-label="Portal header">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:24,flexWrap:'wrap'}}>
        <div>
          {Eyebrow&&<Eyebrow ticks>Player portal</Eyebrow>}
          <h1 style={{margin:'12px 0 0',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h2)',lineHeight:1.02,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Maya R.</h1>
        </div>
        <span style={mono(12)}>PROTOTYPE · SAMPLE DATA · GREEN GROUP · MURDOCK PARK</span>
      </div>
      <nav aria-label="Portal sections" style={{display:'flex',gap:26,marginTop:28,borderBottom:'var(--hairline)'}}>
        {TABS.map((t,i)=><button key={t} onClick={()=>{setTab(i);location.hash=t.toLowerCase();}} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px 12px',fontFamily:'var(--font-sans)',fontSize:'var(--size-label)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:tab===i?'var(--ink)':'var(--ink-secondary)',borderBottom:tab===i?'2px solid var(--ink)':'2px solid transparent',marginBottom:-1}}>{t}</button>)}
      </nav>
    </div>
    <main style={{...container,paddingBottom:96}} data-screen-label={TABS[tab]}>
      {tab===0&&<StatsTab/>}{tab===1&&<CalendarTab/>}{tab===2&&<BookingsTab/>}{tab===3&&<StoreTab/>}{tab===4&&<ProfileTab/>}
    </main>
  </div>;
}
Object.assign(window,{MTPortal:{Portal}});

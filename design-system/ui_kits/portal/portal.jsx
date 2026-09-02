const NS=window.MomentumTennisDesignSystem_0ea6ac||{};
const {SiteNav,Wordmark,FrameTicks,Button,Eyebrow,CourtMeter,TextField,Tabs,StatusChip}=NS;
const FLOWS=window.MTPortalFlows||{};
const mono=(s=13)=>({fontFamily:'var(--font-mono)',fontSize:s/16+'rem',lineHeight:1.5,color:'var(--text-secondary)'});
const lbl={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--text-secondary)'};
const h3={margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h3)',lineHeight:1.05,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'};
const card={background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'};
const container={maxWidth:'var(--container)',margin:'0 auto'};
const TABS=[{id:'stats',label:'Stats'},{id:'calendar',label:'Calendar'},{id:'bookings',label:'Bookings'},{id:'store',label:'Store'},{id:'waivers',label:'Waivers'},{id:'profile',label:'Profile'}];
function useMobile(){
  const [m,setM]=React.useState(()=>window.matchMedia('(max-width:760px)').matches);
  React.useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}

// —— sample data (prototype only) ——
const SHOTS=[{k:'Forehand',n:142,peak:0.86},{k:'Backhand',n:98,peak:0.71},{k:'Serve',n:36,peak:0.93},{k:'Volley',n:22,peak:0.54}];
const LEADERS=[['1','K. T.',1240],['2','M. R.',1185],['3','A. S.',1120],['4','J. L.',1050],['5','D. P.',980]];
const ATTEND=[1,1,1,0,1,1,1,1,0,1];
const PAYMENTS=[{item:'Summer camp — Week 6 (full day)',amt:'$495',status:'PAID · JUL 10'},{item:'Junior classes — 8-session pack',amt:'$360',status:'PAID · JUN 02'}];
const MOVED_AT=new Date(2026,6,28);
const BOOKINGS=[{title:'Junior classes & teams',detail:'Green ball · Murdock Park',sched:'Mon · Tue · Thu 17:00–18:30',left:'5 of 8 sessions left',status:'ACTIVE'},{title:'Summer camp — Week 10',detail:'12U · De Anza College',sched:'Aug 11–15 · 09:00–17:00',left:'Full day',status:'UPCOMING'}];
const daySlots=(d)=>{const dow=new Date(2026,7,d).getDay();
  if(dow===0||dow===6)return[{t:'09:00–11:00',p:'Junior classes — all ball levels',loc:'DE ANZA',spots:d%3+1},{t:'11:00–13:00',p:'Yellow ball int. & advanced',loc:'DE ANZA',spots:d%2},{t:'09:00–11:00',p:'Adult clinic',loc:'DE ANZA',spots:2}];
  if(dow===1||dow===2||dow===4)return[{t:'16:00–17:00',p:'Orange ball',loc:'MURDOCK',spots:d%4},{t:'17:00–18:30',p:'Green ball',loc:'MURDOCK',spots:(d+1)%3},{t:'18:30–20:00',p:'Yellow ball',loc:'MURDOCK',spots:2}];
  return[];};

function StatsTab({isMobile,player,onStore}){
  const recentMove=(Date.now()-MOVED_AT.getTime())/864e5<30;
  const CreditsCard=FLOWS.CreditsCard;
  const sessionCard=<div key="session" style={card}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:16,gap:12,flexWrap:'wrap'}}>
      <h3 style={h3}>Session — Aug 6</h3>
      <span style={mono(12)}>GRIP SENSOR · IMU + PRESSURE · SYNCED 09:42</span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:16,borderTop:'var(--hairline)',paddingTop:16}}>
      {SHOTS.map(s=><div key={s.k}>
        <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2.25rem',lineHeight:1,color:'var(--ink)'}}>{s.n}</div>
        <div style={{...lbl,marginTop:6}}>{s.k}</div>
        <div style={{height:6,background:'var(--court-050)',marginTop:10,position:'relative'}}><div style={{position:'absolute',inset:'0 auto 0 0',width:s.peak*100+'%',background:'var(--court-400)'}}></div></div>
        <div style={{...mono(11),marginTop:4}}>PEAK GRIP {Math.round(s.peak*100)}%</div>
      </div>)}
    </div>
    <p style={{...mono(12),marginTop:16,marginBottom:0}}>298 SHOTS CLASSIFIED · RALLY AVG 6.2 · LONGEST RALLY 19 · SWING SPEED P95 61 MPH</p>
  </div>;
  const attendanceCard=<div key="attend" style={card}>
    <div style={{...lbl,marginBottom:12}}>Attendance — last 10 sessions</div>
    <div style={{display:'flex',gap:6,alignItems:'center'}}>
      {ATTEND.map((a,i)=><span key={i} style={{width:18,height:18,background:a?'var(--court-400)':'transparent',border:a?'1px solid transparent':'var(--hairline)',boxSizing:'border-box'}}></span>)}
      <span style={{...mono(12),marginLeft:12}}>8 / 10 · 80%</span>
    </div>
  </div>;
  const meterCard=<div key="meter" style={card}>
    {CourtMeter&&<CourtMeter court={player.court} caption="MOVED UP · JUL 28" label="Court placement"/>}
    <p style={{...mono(12),marginTop:14,marginBottom:0}}>COURTS ORDERED BY DIFFICULTY 1–5. COACHES MOVE PLAYERS BETWEEN COURTS DURING THE SEASON — THE METER FOLLOWS.</p>
    {isMobile&&recentMove&&<div style={{...mono(11),marginTop:10,color:'var(--accent-present-hover)'}}>PLACEMENT CHANGED — PINNED TO TOP</div>}
  </div>;
  const creditsCard=CreditsCard?<CreditsCard key="credits" player={player} onStore={onStore}/>:null;
  const leaderCard=<div key="leaders" style={card}>
    <div style={{...lbl,marginBottom:10}}>Leaderboard — Green group</div>
    {LEADERS.map(r=><div key={r[0]} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'8px 0',borderBottom:'var(--hairline)',alignItems:'baseline'}}>
      <span style={mono(12)}>{r[0].padStart(2,'0')}</span>
      <span style={{flex:1,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:r[1]==='M. R.'?600:400,color:'var(--ink)'}}>{r[1]}{r[1]==='M. R.'&&' — Maya'}</span>
      <span style={mono(12)}>{r[2]} PTS</span>
    </div>)}
  </div>;
  const payCard=<div key="pay" style={card}>
    <div style={{...lbl,marginBottom:10}}>Payments</div>
    {PAYMENTS.map((p,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'8px 0',borderBottom:'var(--hairline)',flexWrap:'wrap'}}>
      <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',color:'var(--ink)'}}>{p.item}</span>
      <span style={{...mono(12),whiteSpace:'nowrap'}}>{p.amt} · {p.status}</span>
    </div>)}
    <div style={{...mono(12),marginTop:10}}>NEXT: FALL JUNIORS PACKAGE — DUE SEP 1</div>
  </div>;
  if(isMobile)return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    {recentMove?[meterCard,sessionCard,creditsCard,attendanceCard,leaderCard,payCard]:[sessionCard,creditsCard,attendanceCard,meterCard,leaderCard,payCard]}
  </div>;
  return <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:24,alignItems:'start'}}>
    <div style={{display:'flex',flexDirection:'column',gap:24}}>{sessionCard}{attendanceCard}</div>
    <div style={{display:'flex',flexDirection:'column',gap:24}}>{creditsCard}{meterCard}{leaderCard}{payCard}</div>
  </div>;
}

function DayDetail({sel,gated}){
  const slots=daySlots(sel);
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}><h3 style={{...h3,fontSize:'1.375rem'}}>Aug {sel}</h3><span style={mono(12)}>{new Date(2026,7,sel).toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}</span></div>
    {slots.length===0&&<p style={{...mono(12),margin:'12px 0 0'}}>NO SESSIONS — COURTS REST ON WED &amp; FRI.</p>}
    {slots.map((s,i)=><div key={i} style={{padding:'14px 0',borderTop:i?'var(--hairline)':'none',display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12}}><span style={{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--court-500)'}}>{s.t}</span><span style={mono(11)}>{s.loc}</span></div>
      <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body-sm)',color:'var(--ink)'}}>{s.p}</div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={mono(11)}>{s.spots>0?s.spots+' SPOTS OPEN':'WAITLIST'}</span>
        {gated
          ?<span role="alert" style={{...mono(11),color:'var(--state-error)'}}>BOOKING PAUSED — RE-CONSENT REQUIRED</span>
          :Button&&<Button variant="secondary" size="sm" href="#book">{s.spots>0?'Book':'Join waitlist'}</Button>}
      </div>
    </div>)}
  </div>;
}

function CalendarTab({isMobile,gated,onFix,player}){
  const [sel,setSel]=React.useState(8);
  const [sheet,setSheet]=React.useState(false);
  const ReconsentBanner=FLOWS.ReconsentBanner;
  const first=new Date(2026,7,1).getDay();
  const cells=[...Array(first).fill(null),...Array.from({length:31},(_,i)=>i+1)];
  const grid=<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:isMobile?3:4}}>
    {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=><div key={d} style={{...mono(10.5),textAlign:'center',padding:'4px 0'}}>{d}</div>)}
    {cells.map((d,i)=>{
      if(!d)return <div key={'e'+i}></div>;
      const n=daySlots(d).length;const open=daySlots(d).reduce((a,s)=>a+s.spots,0);
      const active=sel===d;
      return <button key={d} onClick={()=>{setSel(d);if(isMobile)setSheet(true);}} style={{minHeight:isMobile?48:undefined,aspectRatio:isMobile?undefined:'1/0.82',border:active?'1px solid var(--ink)':'var(--hairline)',background:n?(active?'var(--court-050)':'var(--white)'):'var(--surface-page)',cursor:'pointer',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'6px 7px',borderRadius:0}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:n?'var(--ink)':'var(--text-secondary)',textAlign:'left'}}>{d}</span>
        {n>0&&<span style={{display:'flex',gap:3}}>{Array.from({length:n},(_,j)=><span key={j} style={{width:6,height:6,background:open?'var(--court-400)':'var(--court-200)'}}></span>)}</span>}
      </button>;})}
  </div>;
  const header=<div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:14,gap:12}}><h3 style={h3}>August 2026</h3><span style={mono(12)}>DE ANZA + MURDOCK</span></div>;
  const legend=<div style={{...mono(11),marginTop:10}}>■ = A SESSION RUNS THAT DAY · TAP A DAY FOR SLOTS</div>;
  const gateBanner=gated&&ReconsentBanner?<div style={{marginBottom:16}}><ReconsentBanner player={player} onGo={onFix}/></div>:null;
  if(isMobile)return <div>
    {gateBanner}
    <div style={{width:'100vw',margin:'0 calc(50% - 50vw)',boxSizing:'border-box',background:'var(--white)',borderTop:'var(--hairline)',borderBottom:'var(--hairline)',padding:'20px 12px 24px'}}>
    {header}{grid}{legend}
    {sheet&&<div onClick={()=>setSheet(false)} style={{position:'fixed',inset:0,background:'rgba(18,37,59,0.55)',zIndex:40}}></div>}
    {sheet&&<div role="dialog" aria-modal="true" aria-label={'Sessions on August '+sel} style={{position:'fixed',left:0,right:0,bottom:0,zIndex:41,background:'var(--white)',borderTop:'2px solid var(--ink)',maxHeight:'72vh',overflowY:'auto',padding:'16px 16px calc(24px + env(safe-area-inset-bottom))'}}>
      <div style={{display:'flex',justifyContent:'flex-end'}}><button onClick={()=>setSheet(false)} aria-label="Close day detail" style={{width:44,height:44,background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'1.25rem',color:'var(--ink)'}}>×</button></div>
      <DayDetail sel={sel} gated={gated}/>
    </div>}
  </div></div>;
  return <div>
    {gateBanner}
    <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:24,alignItems:'start'}}>
    <div style={card}>{header}{grid}{legend}</div>
    <div style={card}><DayDetail sel={sel} gated={gated}/></div>
  </div></div>;
}

function BookingsTab({gated,onFix,player}){
  const ReconsentBanner=FLOWS.ReconsentBanner;
  return <div style={{display:'flex',flexDirection:'column',gap:16,maxWidth:760}}>
    {gated&&ReconsentBanner&&<ReconsentBanner player={player} onGo={onFix}/>}
    {BOOKINGS.map((b,i)=><div key={i} style={{...card,display:'grid',gridTemplateColumns:'1fr auto',gap:'6px 24px'}}>
      <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>{b.title}</div>
      <span style={{justifySelf:'end'}}>{StatusChip?<StatusChip status={b.status}/>:<span style={mono(11)}>{b.status}</span>}</span>
      <div style={mono(12)}>{b.detail.toUpperCase()} · {b.sched.toUpperCase()}</div>
      <span style={{...mono(12),textAlign:'right'}}>{b.left.toUpperCase()}</span>
    </div>)}
    <p style={{...mono(12),margin:0}}>RESCHEDULES FOLLOW THE CANCELATION POLICY — 24H NOTICE.</p>
  </div>;
}

function ProfileTab({isMobile,players}){
  return <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:isMobile?16:24,maxWidth:860,alignItems:'start'}}>
    <div style={{...card,display:'flex',flexDirection:'column',gap:16}}>
      <div style={lbl}>Parent — account owner</div>
      {TextField&&<TextField label="Name" defaultValue="Priya R."/>}
      {TextField&&<TextField label="Email" type="email" defaultValue="priya@example.com"/>}
      {TextField&&<TextField label="Phone" type="tel" defaultValue="669-264-0000"/>}
      {Button&&<div><Button variant="secondary" size="sm">Save changes</Button></div>}
    </div>
    <div style={{...card,display:'flex',flexDirection:'column',gap:14}}>
      <div style={lbl}>Linked players</div>
      {players.map(p=><div key={p.id} style={{display:'flex',flexDirection:'column',gap:4,borderBottom:'var(--hairline)',paddingBottom:12}}>
        <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>{p.name} — {p.group.split(' · ')[0]}</div>
        <div style={mono(12)}>CHILD LOGIN: ENABLED · SHARES THIS ACCOUNT</div>
      </div>)}
      <div style={mono(12)}>CHILD SEES: STATS · LEADERBOARD · CALENDAR<br/>HIDDEN: PAYMENTS · STORE CHECKOUT · WAIVERS</div>
      {Button&&<div><Button variant="ghost" size="sm">Manage child access</Button></div>}
    </div>
  </div>;
}

function Portal(){
  const isMobile=useMobile();
  const players=FLOWS.PLAYERS||[{id:'maya',name:'Maya R.',group:'Green group',credits:8,creditsExpire:'2027-03-01',court:3,gate:null}];
  const initial=TABS.findIndex(t=>t.id===(location.hash||'').replace('#',''));
  const [tab,setTab]=React.useState(initial>=0?TABS[initial].id:'stats');
  const [pid,setPid]=React.useState(players[0].id);
  const [signed,setSigned]=React.useState({});
  const player=players.find(p=>p.id===pid);
  const gated=!!(player.gate&&!signed[player.id+':'+player.gate.doc]);
  const go=(id)=>{setTab(id);location.hash=id;};
  const {PlayerSwitcher,WaiversTab,StoreFlow}=FLOWS;
  return <div style={{background:'var(--surface-page)',minHeight:'100vh'}}>
    {SiteNav&&<SiteNav active={tab==='calendar'?'calendar':tab==='store'?'store':'account'} loggedIn links={{home:'../website/index.html',juniors:'../website/index.html#programs',camps:'../website/index.html#camps',adults:'../website/index.html#programs',jtt:'../website/index.html#programs',calendar:'#calendar',store:'#store',login:'#profile',book:'../website/index.html#book',logoSrc:'../../assets/logo-mark.svg'}}/>}
    <div style={{...container,padding:isMobile?'28px 16px 18px':'40px 32px 32px'}} data-screen-label="Portal header">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:isMobile?12:24,flexWrap:'wrap'}}>
        <div>
          {Eyebrow&&<Eyebrow ticks>Player portal</Eyebrow>}
          <h1 style={{margin:'12px 0 0',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h2)',lineHeight:1.02,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>{player.name}</h1>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,alignItems:isMobile?'flex-start':'flex-end'}}>
          <span style={mono(12)}>PROTOTYPE · SAMPLE DATA · {player.group.toUpperCase()}</span>
          {PlayerSwitcher&&players.length>1&&<PlayerSwitcher players={players} current={pid} onChange={setPid}/>}
        </div>
      </div>
      {!isMobile&&Tabs&&<div style={{marginTop:28}}><Tabs items={TABS} active={tab} onChange={go} ariaLabel="Portal sections"/></div>}
    </div>
    <main style={{...container,padding:isMobile?'0 16px 140px':'0 32px 96px'}} data-screen-label={tab}>
      {tab==='stats'&&<StatsTab isMobile={isMobile} player={player} onStore={()=>go('store')}/>}
      {tab==='calendar'&&<CalendarTab isMobile={isMobile} gated={gated} player={player} onFix={()=>go('waivers')}/>}
      {tab==='bookings'&&<BookingsTab gated={gated} player={player} onFix={()=>go('waivers')}/>}
      {tab==='store'&&StoreFlow&&<StoreFlow players={players} isMobile={isMobile} defaultPlayer={pid}/>}
      {tab==='waivers'&&WaiversTab&&<WaiversTab player={player} signed={signed} onSign={(k)=>setSigned(s=>({...s,[k]:true}))}/>}
      {tab==='profile'&&<ProfileTab isMobile={isMobile} players={players}/>}
    </main>
    {isMobile&&Tabs&&<Tabs items={TABS} active={tab} onChange={go} mobileMode="bottom" ariaLabel="Portal sections"/>}
  </div>;
}
Object.assign(window,{MTPortal:{Portal}});

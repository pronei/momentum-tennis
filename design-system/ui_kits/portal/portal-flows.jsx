const NSF=window.MomentumTennisDesignSystem_0ea6ac||{};
const {Button:FBtn,TextField:FTF,Checkbox:FChk,Select:FSel,Banner:FBnr,StatusChip:FChip,FrameTicks:FTicks,EmptyState:FES}=NSF;
const fmono=(s=13,c)=>({fontFamily:'var(--font-mono)',fontSize:s/16+'rem',lineHeight:1.5,letterSpacing:'0.05em',textTransform:'uppercase',color:c||'var(--text-secondary)'});
const flbl={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--text-secondary)'};
const fcard={background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'};

// —— SAMPLE DATA: one account, two players (multi-player household) ——
const PLAYERS=[
  {id:'maya',name:'Maya R.',group:'Green group · Murdock Park',credits:8,creditsExpire:'2027-03-01',court:3,gate:null},
  {id:'dev',name:'Dev R.',group:'Orange group · Murdock Park',credits:2,creditsExpire:'2026-11-15',court:2,gate:{doc:'Liability waiver',version:'V3',published:'2026-06-01'}},
];
const WAIVER_DOCS=[
  {id:'liability',title:'Liability waiver',version:'V3',published:'2026-06-01'},
  {id:'media',title:'Media release',version:'V2',published:'2025-09-14'},
];

function PlayerSwitcher({players,current,onChange}){
  return React.createElement('div',{role:'group','aria-label':'Player',style:{display:'flex',gap:4,flexWrap:'wrap'}},
    players.map(p=>React.createElement('button',{key:p.id,'aria-pressed':p.id===current,onClick:()=>onChange(p.id),
      style:{minHeight:44,padding:'0 14px',background:p.id===current?'var(--court-050)':'none',cursor:'pointer',borderRadius:0,
        border:p.id===current?'1px solid var(--ink)':'1px solid var(--border-hairline)',
        fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.08em',textTransform:'uppercase',
        color:'var(--ink)',fontWeight:p.id===current?600:400}},p.name)));
}

function CreditsCard({player,onStore}){
  const low=player.credits<=2;
  return <div style={fcard}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12}}>
      <span style={flbl}>Credits — {player.name}</span>
      <span style={fmono(11)}>EXPIRES {player.creditsExpire}</span>
    </div>
    <div style={{display:'flex',alignItems:'baseline',gap:12,marginTop:10}}>
      <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'2.75rem',lineHeight:1,color:'var(--ink)'}}>{player.credits}</span>
      <span style={fmono(12)}>CLASS CREDITS LEFT</span>
    </div>
    {low&&<div style={{marginTop:12,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',borderTop:'var(--hairline)',paddingTop:12}}>
      <span role="alert" style={fmono(11,'var(--state-error)')}>LOW BALANCE — {player.credits} LEFT COVERS {player.credits} MORE {player.credits===1?'CLASS':'CLASSES'}</span>
      {FBtn&&<FBtn variant="ghost" size="sm" onClick={onStore}>Buy a pack →</FBtn>}
    </div>}
  </div>;
}

function ReconsentBanner({player,onGo}){
  if(!player.gate)return null;
  return <FBnr tone="error" action={FBtn?<FBtn variant="secondary" size="sm" onClick={onGo}>Review &amp; sign</FBtn>:null}>
    {player.name} needs re-consent — {player.gate.doc} {player.gate.version}. Booking is paused until a guardian re-signs.
  </FBnr>;
}

function WaiversTab({player,signed,onSign,guardian='Priya R.'}){
  const [view,setView]=React.useState('list'); // list | sign | receipt
  const [doc,setDoc]=React.useState(WAIVER_DOCS[0]);
  const [name,setName]=React.useState('');
  const [agree,setAgree]=React.useState(false);
  const gate=player.gate&&!signed[player.id+':'+player.gate.doc];
  const status=(d)=>{
    if(player.gate&&d.title===player.gate.doc&&!signed[player.id+':'+d.title])return {chip:'NEEDS RE-CONSENT',meta:'YOUR SIGNATURE IS FOR V2 · '+d.version+' PUBLISHED '+d.published};
    return {chip:'SIGNED',meta:'SIGNED · '+d.version+' · JUN 01 · BY '+guardian.toUpperCase()};
  };
  if(view==='sign')return <div style={{maxWidth:640,display:'flex',flexDirection:'column',gap:16}}>
    <div><FBtn variant="ghost" size="sm" onClick={()=>setView('list')}>← All waivers</FBtn></div>
    <div style={fmono(12,'var(--ink)')}>{doc.title.toUpperCase()} · {doc.version} · PUBLISHED {doc.published}</div>
    <div style={{border:'var(--hairline)',background:'var(--white)',height:240,overflowY:'auto',padding:'16px 20px'}} tabIndex={0} aria-label="Waiver document">
      {[1,2,3].map(i=><p key={i} style={{margin:'0 0 14px',fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',lineHeight:1.6,color:'var(--text-secondary)'}}>
        <span style={fmono(10.5)}>[FROM LEGAL — PLACEHOLDER SECTION {i}] </span>
        The design system writes no waiver language. Final copy is supplied and versioned by counsel; this frame shows the mechanism only.</p>)}
    </div>
    <div style={{...fmono(12,'var(--ink)'),border:'var(--hairline)',background:'var(--court-050)',padding:'10px 14px'}}>SIGNING AS PARENT/GUARDIAN FOR {player.name.toUpperCase()} — SET BY YOUR ACCOUNT, NOT EDITABLE</div>
    {FTF&&<FTF label="Type your full legal name" value={name} onChange={(e)=>setName(e.target.value)} placeholder={guardian} inputStyle={{fontFamily:'var(--font-mono)'}} help="YOUR TYPED NAME IS THE SIGNATURE OF RECORD"/>}
    {FChk&&<FChk consent label={'I have read '+doc.title+' '+doc.version+' and agree on behalf of '+player.name+'.'} checked={agree} onChange={(e)=>setAgree(e.target.checked)}/>}
    <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      {FBtn&&<FBtn disabled={name.trim().length<3||!agree} onClick={()=>{onSign(player.id+':'+doc.title);setView('receipt');}}>Sign waiver</FBtn>}
      <span style={fmono(11)}>2026-08-28 · RECORDED WITH TIMESTAMP + VERSION</span>
    </div>
  </div>;
  if(view==='receipt')return <div style={{maxWidth:640,display:'flex',flexDirection:'column',gap:16,alignItems:'flex-start'}}>
    {FTicks&&<FTicks/>}
    <h3 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.375rem',letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Signed.</h3>
    <div style={fmono(12,'var(--ink)')}>SIGNED · {doc.version} · 2026-08-28 · {(name||guardian).toUpperCase()} · GUARDIAN OF {player.name.toUpperCase()}</div>
    {FBnr&&<FBnr>A copy was emailed to priya@example.com. Booking for {player.name} resumes immediately.</FBnr>}
    <FBtn variant="ghost" size="sm" onClick={()=>{setView('list');setName('');setAgree(false);}}>← All waivers</FBtn>
  </div>;
  return <div style={{maxWidth:760,display:'flex',flexDirection:'column',gap:16}}>
    {gate&&<ReconsentBanner player={player} onGo={()=>{setDoc(WAIVER_DOCS[0]);setView('sign');}}/>}
    {WAIVER_DOCS.map(d=>{const s=status(d);
      return <div key={d.id} style={{...fcard,display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body)',fontWeight:600,color:'var(--ink)'}}>{d.title} — {player.name}</span>
          <span style={fmono(11)}>{s.meta}</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          {FChip&&<FChip status={s.chip}/>}
          {FBtn&&(s.chip==='NEEDS RE-CONSENT'
            ?<FBtn variant="secondary" size="sm" onClick={()=>{setDoc(d);setView('sign');}}>Review &amp; sign</FBtn>
            :<FBtn variant="ghost" size="sm" onClick={()=>{setDoc(d);setView('sign');}}>View</FBtn>)}
        </div>
      </div>;})}
    <p style={{...fmono(11),margin:0}}>PUBLISHED VERSIONS ARE FROZEN. A NEW VERSION FROM THE ACADEMY PAUSES BOOKING UNTIL A GUARDIAN RE-SIGNS.</p>
  </div>;
}

const PACKAGES_F=[{id:'jr8',name:'Junior classes · 8 pack',price:360,member:324,detail:'Any ball level · Murdock or De Anza',credits:8},{id:'campfw',name:'Summer camp · full week',price:495,member:445,detail:'09:00–17:00 · tennis + studios',credits:0},{id:'camphw',name:'Summer camp · half week',price:315,member:283,detail:'09:00–13:00 · tennis mornings',credits:0},{id:'ad4',name:'Adult clinic · 4 pack',price:220,member:198,detail:'Weekend mornings · De Anza',credits:4}];
const usd=(n)=>'$'+n.toFixed(2);
function StoreFlow({players,isMobile,defaultPlayer}){
  const [cart,setCart]=React.useState([]);
  const [state,setState]=React.useState('shop'); // shop | paid
  const total=cart.reduce((a,c)=>a+PACKAGES_F.find(p=>p.id===c.pkg).member,0);
  const unassigned=cart.some(c=>!c.player);
  if(state==='paid')return <div style={{maxWidth:640,display:'flex',flexDirection:'column',gap:16,alignItems:'flex-start'}}>
    {FTicks&&<FTicks/>}
    <h3 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.375rem',letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Paid.</h3>
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      <span style={fmono(12,'var(--ink)')}>PAID · {usd(total)} · ORDER M-1043 · 2026-08-28</span>
      {cart.map((c,i)=>{const p=PACKAGES_F.find(x=>x.id===c.pkg);const pl=players.find(x=>x.id===c.player);
        return <span key={i} style={fmono(12)}>{p.credits?p.credits+' CREDITS ISSUED · '+pl.name.toUpperCase()+' · EXPIRES 2027-03-01':p.name.toUpperCase()+' · '+pl.name.toUpperCase()}</span>;})}
      <span style={fmono(12)}>STRIPE CHECKOUT REF CS_A1B2C3D4 · RECEIPT EMAILED</span>
    </div>
    {FBtn&&<FBtn variant="ghost" size="sm" onClick={()=>{setCart([]);setState('shop');}}>← Back to store</FBtn>}
  </div>;
  return <div style={{display:'grid',gridTemplateColumns:isMobile||!cart.length?'1fr':'2fr 1fr',gap:24,alignItems:'start'}}>
    <div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat('+(cart.length?2:4)+',1fr)',gap:isMobile?12:16}}>
        {PACKAGES_F.map(p=><div key={p.id} style={{...fcard,padding:isMobile?'16px 16px':fcard.padding,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'}}>{p.name}</div>
          <div style={fmono(12)}>{p.detail.toUpperCase()}</div>
          <div style={{marginTop:'auto',display:'flex',flexDirection:'column',gap:2}}>
            <span style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.75rem',color:'var(--ink)'}}>{usd(p.price)}</span>
            <span style={fmono(11,'var(--court-500)')}>MEMBER {usd(p.member)} — APPLIED AT CHECKOUT</span>
          </div>
          {FBtn&&<FBtn variant="secondary" size="sm" onClick={()=>setCart(c=>[...c,{pkg:p.id,player:defaultPlayer}])}>Add to cart</FBtn>}
        </div>)}
      </div>
      <p style={{...fmono(12),marginTop:16,marginBottom:0}}>PUBLIC PRICES SHOWN TO SIGNED-OUT VISITORS · MEMBER PRICES REQUIRE A GUARDIAN LOGIN</p>
    </div>
    {cart.length>0&&<div style={{...fcard,display:'flex',flexDirection:'column',gap:14}}>
      <span style={flbl}>Cart — {cart.length} {cart.length===1?'item':'items'}</span>
      {cart.map((c,i)=>{const p=PACKAGES_F.find(x=>x.id===c.pkg);
        return <div key={i} style={{display:'flex',flexDirection:'column',gap:8,borderBottom:'var(--hairline)',paddingBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'baseline'}}>
            <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:600,color:'var(--ink)'}}>{p.name}</span>
            <button onClick={()=>setCart(cs=>cs.filter((_,j)=>j!==i))} aria-label={'Remove '+p.name} style={{width:32,height:32,background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'1rem',color:'var(--ink)'}}>×</button>
          </div>
          {FSel&&<FSel label="For player" options={players.map(pl=>({value:pl.id,label:pl.name}))} value={c.player||''} placeholder="Assign a player"
            onChange={(e)=>setCart(cs=>cs.map((x,j)=>j===i?{...x,player:e.target.value}:x))}
            error={c.player?undefined:'credits belong to a named player'}/>}
          <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
            <span style={fmono(11)}>{usd(p.price)} PUBLIC</span><span style={fmono(12,'var(--ink)')}>{usd(p.member)} MEMBER</span>
          </div>
        </div>;})}
      <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
        <span style={flbl}>Total</span><span style={fmono(14,'var(--ink)')}>{usd(total)}</span>
      </div>
      <span style={fmono(10.5)}>CREDITS BELONG TO THE NAMED PLAYER — THEY ARE NOT TRANSFERABLE BETWEEN SIBLINGS.</span>
      {FBtn&&<FBtn disabled={unassigned} onClick={()=>setState('paid')}>Continue to payment</FBtn>}
      <span style={fmono(10.5)}>STRIPE-HOSTED CHECKOUT FOLLOWS · CARD DETAILS NEVER TOUCH THIS SITE</span>
    </div>}
  </div>;
}

Object.assign(window,{MTPortalFlows:{PLAYERS,PlayerSwitcher,CreditsCard,ReconsentBanner,WaiversTab,StoreFlow}});

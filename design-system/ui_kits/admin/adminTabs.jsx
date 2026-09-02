const NS2=window.MomentumTennisDesignSystem_0ea6ac||{};
const {Button:BtnA,Tabs:TabsA,DataTable:DT,StatusChip:Chip,Dialog:Dlg,Banner:Bnr,RatingMeter:RM,TextField:TF,TextArea:TA,SegmentedControl:Seg,DateField:DF,FormSection:FS,Select:Sel,Toast:Tst,EmptyState:ES}=NS2;
const monoA=(s=13,c)=>({fontFamily:'var(--font-mono)',fontSize:s/16+'rem',lineHeight:1.5,letterSpacing:'0.05em',textTransform:'uppercase',color:c||'var(--text-secondary)'});
const lblA={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--text-secondary)'};
const cardA={background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'};

const PLAYERS_ROWS=[
  {player:'Maya R.',guardian:'Priya R.',born:'2014 · MINOR',group:'Green',waiver:'SIGNED',credits:'8'},
  {player:'Dev R.',guardian:'Priya R.',born:'2016 · MINOR',group:'Orange',waiver:'NEEDS RE-CONSENT',credits:'2'},
  {player:'Zara S.',guardian:'Amir S.',born:'2013 · MINOR',group:'Green',waiver:'SIGNED',credits:'6'},
  {player:'Leo M.',guardian:'Sofia M.',born:'2015 · MINOR',group:'Orange',waiver:'SIGNED',credits:'3'},
  {player:'Wei Z.',guardian:'— (self)',born:'1988',group:'Adult clinic',waiver:'SIGNED',credits:'4'},
];
function PlayersTab(){
  return <div style={{display:'flex',flexDirection:'column',gap:12}}>
    <span style={monoA(12)}>5 PLAYERS · 4 MINORS · GUARDIANSHIP LINKS SHOWN · MINOR = DERIVED FROM BIRTH YEAR, NEVER STORED AS A FLAG</span>
    <DT columns={[
      {key:'player',label:'Player'},
      {key:'guardian',label:'Guardian'},
      {key:'born',label:'Born',mono:true},
      {key:'group',label:'Group'},
      {key:'waiver',label:'Waiver',render:r=><Chip status={r.waiver}/>},
      {key:'credits',label:'Credits',numeric:true},
    ]} rows={PLAYERS_ROWS} empty="NO PLAYERS"/>
  </div>;
}

function WaiversAdminTab(){
  const [publish,setPublish]=React.useState(false);
  const DOCS=[
    {doc:'Liability waiver',ver:'V3',status:'PUBLISHED',meta:'PUBLISHED 2026-06-01 · 41 SIGNERS · 1 PENDING'},
    {doc:'Media release',ver:'V2',status:'PUBLISHED',meta:'PUBLISHED 2025-09-14 · 38 SIGNERS'},
    {doc:'Liability waiver',ver:'V4',status:'DRAFT',meta:'EDITED 2026-08-25 · UNPUBLISHED'},
  ];
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:24,alignItems:'start'}}>
    <div style={cardA}>
      <div style={{...lblA,marginBottom:8}}>Documents</div>
      {DOCS.map((d,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'12px 0',borderBottom:'var(--hairline)',alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:600,color:'var(--ink)'}}>{d.doc} — {d.ver}</span>
          <span style={monoA(11)}>{d.meta}</span>
        </div>
        <Chip status={d.status}/>
      </div>)}
      <p style={{...monoA(11),marginTop:12,marginBottom:0}}>PUBLISHED VERSIONS ARE FROZEN — EDITS ALWAYS CREATE A NEW DRAFT.</p>
    </div>
    <div style={{...cardA,display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12}}>
        <span style={lblA}>Version editor — draft</span>
        <span style={monoA(11)}>LIABILITY WAIVER · V4 · DRAFT</span>
      </div>
      <TA rows={6} defaultValue={'[FROM LEGAL — PLACEHOLDER. THE DESIGN SYSTEM WRITES NO WAIVER LANGUAGE.]\n\nSection 1 — Assumption of risk…\nSection 2 — Media…'} help="ALL DOCUMENT COPY COMES FROM LEGAL"/>
      <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
        <BtnA variant="ghost" size="sm">Save draft</BtnA>
        <BtnA variant="secondary" size="sm" onClick={()=>setPublish(true)}>Publish V4</BtnA>
      </div>
    </div>
    <Dlg open={publish} onClose={()=>setPublish(false)} title="Publish V4"
      consequence="PUBLISHING V4 REQUIRES RE-CONSENT FROM 41 SIGNERS AND FREEZES THE VERSION PERMANENTLY"
      actions={<React.Fragment>
        <BtnA variant="ghost" onClick={()=>setPublish(false)}>Keep as draft</BtnA>
        <BtnA variant="secondary" style={{color:'var(--state-error)',borderColor:'var(--state-error)'}} onClick={()=>setPublish(false)}>Publish V4</BtnA>
      </React.Fragment>}>
      <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',lineHeight:1.55,color:'var(--ink)'}}>Every family with a V3 signature is emailed a re-consent request. Booking pauses for players whose guardians have not re-signed.</p>
    </Dlg>
  </div>;
}

const DIMS_DEFAULT=[{label:'Technique',vis:'family'},{label:'Footwork',vis:'family'},{label:'Consistency',vis:'family'},{label:'Match play',vis:'family'},{label:'Attitude',vis:'internal'}];
function RatingsTab(){
  const [dims,setDims]=React.useState(DIMS_DEFAULT);
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:24,alignItems:'start'}}>
    <div style={cardA}>
      <div style={{...lblA,marginBottom:8}}>Dimensions</div>
      {dims.map((d,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'12px 0',borderBottom:'var(--hairline)',alignItems:'center',flexWrap:'wrap'}}>
        <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',fontWeight:600,color:'var(--ink)'}}>{d.label}</span>
        <Seg compact options={[{value:'family',label:'Visible to family'},{value:'internal',label:'Internal'}]} value={d.vis}
          onChange={(v)=>setDims(ds=>ds.map((x,j)=>j===i?{...x,vis:v}:x))}/>
      </div>)}
      <p style={{...monoA(11),marginTop:12,marginBottom:0}}>INTERNAL DIMENSIONS NEVER RENDER IN FAMILY-FACING VIEWS.</p>
    </div>
    <div style={cardA}>
      <div style={{...lblA,marginBottom:12}}>Family-facing preview — Maya R.</div>
      <RM dimensions={[
        {label:'Technique',value:3,trend:'+1 · JUL 28'},
        {label:'Footwork',value:2,note:'2 OF 5 · SINCE JUN 14'},
        {label:'Consistency',value:3},
        {label:'Match play',value:2},
      ]}/>
    </div>
  </div>;
}

function SettingsTab(){
  return <div style={{display:'flex',flexDirection:'column',gap:32,maxWidth:760}}>
    <FS eyebrow="Class times" description="The three-block structure is fixed; the academy sets wall-clock starts each season. Weekend 2h = 3×40 min, weekday 1.5h = 3×30 min.">
      {[['SAT & SUN','09:00 · 11:00','DE ANZA','2H'],['MON · TUE · THU','16:00 · 17:00 · 18:30','MURDOCK','1.5H']].map((r,i)=>
        <div key={i} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'10px 0',borderBottom:'var(--hairline)',flexWrap:'wrap'}}>
          <span style={monoA(12,'var(--ink)')}>{r[0]}</span><span style={monoA(12)}>{r[1]} · {r[2]} · {r[3]}</span>
        </div>)}
      <div><BtnA variant="secondary" size="sm">Edit season times</BtnA></div>
    </FS>
    <FS eyebrow="Seasonal events" description="Camps run only in summer — 2nd week of June to end of July. The site derives ENROLLING NOW / RETURNS from these dates.">
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:16}}>
        <DF label="Camp start" defaultValue="2027-06-07"/>
        <DF label="Camp end" defaultValue="2027-07-30"/>
      </div>
      <TF label="Banner blurb" defaultValue="Tennis mornings, studio afternoons — chess, music production, photography, art."/>
    </FS>
    <FS eyebrow="Performance stats" description="The homepage 'Sneak peek at our performance' numbers — one editable record.">
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:16}}>
        <TF label="Dual match wins" defaultValue="155" inputStyle={{fontFamily:'var(--font-mono)'}}/>
        <TF label="League titles" defaultValue="12" inputStyle={{fontFamily:'var(--font-mono)'}}/>
        <TF label="Winning %" defaultValue="69.5" inputStyle={{fontFamily:'var(--font-mono)'}}/>
        <TF label="Range stamp" defaultValue="FALL 2022 – SPRING 2026" inputStyle={{fontFamily:'var(--font-mono)'}}/>
      </div>
      <div><BtnA variant="secondary" size="sm">Save stats</BtnA></div>
    </FS>
  </div>;
}

// —— Coach day sheet (mobile-first) ——
const ROSTER=['Maya R.','Zara S.','Kiran T.','Leo M.','Anya P.','Rohan D.','Emma L.','Dev R.'];
function CoachSheet(){
  const [marked,setMarked]=React.useState({});
  const [toast,setToast]=React.useState(false);
  const [dims,setDims]=React.useState([{label:'Technique',value:3,note:'LAST: 2 OF 5 · JUN 14'},{label:'Footwork',value:2,note:'LAST: 2 OF 5 · JUN 14'},{label:'Attitude',value:0,internal:true,note:'LAST: 4 OF 5 · JUL 02'}]);
  const [who,setWho]=React.useState('Maya R.');
  const [vis,setVis]=React.useState('family');
  const n=Object.values(marked).filter(Boolean).length;
  return <div style={{background:'var(--surface-page)',minHeight:'100vh',padding:'20px 16px 120px'}}>
    <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:18}}>
      <span style={monoA(12)}>THU · 17:00–18:30 · GREEN BALL · MURDOCK · SAMPLE DATA</span>
      <h1 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.75rem',letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Coach sheet</h1>
    </div>
    <div style={{...cardA,padding:'8px 16px',marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'var(--hairline)'}}>
        <span style={lblA}>Attendance</span><span style={monoA(12,'var(--ink)')}>{n} / {ROSTER.length} MARKED</span>
      </div>
      {ROSTER.map(p=>{const on=!!marked[p];
        return <button key={p} onClick={()=>setMarked(m=>({...m,[p]:!m[p]}))} aria-pressed={on}
          style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,width:'100%',minHeight:56,padding:'0 2px',background:'none',border:'none',borderBottom:'var(--hairline)',cursor:'pointer',borderRadius:0}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body)',fontWeight:600,color:'var(--ink)'}}>{p}</span>
          <span aria-hidden="true" style={{width:28,height:28,boxSizing:'border-box',border:'1px solid '+(on?'transparent':'rgba(27,27,27,0.4)'),background:on?'var(--court-400)':'transparent',transition:'background var(--dur-fast) var(--ease-out)'}}></span>
        </button>;})}
      <div style={{padding:'12px 0 8px',display:'flex',justifyContent:'flex-end'}}>
        <BtnA variant="secondary" size="sm" onClick={()=>setToast(true)}>Save attendance</BtnA>
      </div>
    </div>
    <div style={{...cardA,display:'flex',flexDirection:'column',gap:16}}>
      <span style={lblA}>Rate player</span>
      {Sel&&<Sel label="Player" options={ROSTER} value={who} onChange={(e)=>setWho(e.target.value)}/>}
      <RM interactive dimensions={dims} onChange={(di,v)=>setDims(ds=>ds.map((d,i)=>i===di?{...d,value:v}:d))}/>
      {Seg&&<Seg label="Visibility" fullWidth options={[{value:'family',label:'Visible to family'},{value:'internal',label:'Internal'}]} value={vis} onChange={setVis}/>}
      {TA&&<TA label="Note" rows={2} placeholder="One observation from today"/>}
      <div style={{display:'flex',justifyContent:'flex-end'}}><BtnA onClick={()=>setToast(true)}>Save rating</BtnA></div>
    </div>
    {Tst&&<Tst open={toast} onDismiss={()=>setToast(false)}>Saved · {n} / {ROSTER.length}</Tst>}
  </div>;
}

Object.assign(window,{MTAdminParts:{PlayersTab,WaiversAdminTab,RatingsTab,SettingsTab,CoachSheet}});

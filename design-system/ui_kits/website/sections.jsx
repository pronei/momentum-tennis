const NS=window.MomentumTennisDesignSystem_0ea6ac||{};
const {Wordmark,StrobeArc,FrameTicks,Button,Eyebrow,PhotoFrame,ProgramCard,ClassTimeline}=NS;
const P='../../assets/photos/';
const container={maxWidth:'var(--container,1200px)',margin:'0 auto',padding:'0 32px'};
function useMobile(){
  const [m,setM]=React.useState(()=>window.matchMedia('(max-width:760px)').matches);
  React.useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}
const h2Style={margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h2)',lineHeight:1.04,letterSpacing:'0.012em',textTransform:'uppercase'};

// —— ADMIN-SET CONTENT (see PRODUCT.md §12 — in production these come from the admin console) ——
const SEASON_EVENTS=[
  {id:'camp-2026',label:'Summer camps at De Anza',start:'2026-06-08',end:'2026-07-31',blurb:'Tennis mornings, studio afternoons — chess, music production, photography, art.'},
  {id:'camp-2027',label:'Summer camps at De Anza',start:'2027-06-07',end:'2027-07-30',blurb:'Tennis mornings, studio afternoons — chess, music production, photography, art.'}
];
const SITE_STATS={range:'FALL 2022 – SPRING 2026',dualWins:'155',leagues:'12',top3:'29',winPct:69.5,seasons:'39',ratio:'2.28:1'};
const fmtD=(iso)=>new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}).toUpperCase();
function campWindow(){
  const now=new Date();
  const evs=SEASON_EVENTS.map(e=>({...e,s:new Date(e.start+'T00:00:00'),t:new Date(e.end+'T23:59:59')}));
  const cur=evs.find(e=>now>=e.s&&now<=e.t);
  if(cur)return{...cur,status:'ENROLLING NOW',window:fmtD(cur.start)+' – '+fmtD(cur.end)};
  const next=evs.filter(e=>e.s>now).sort((a,b)=>a.s-b.s)[0];
  if(next)return{...next,status:'RETURNS '+next.s.getFullYear(),window:fmtD(next.start)+' – '+fmtD(next.end)+', '+next.s.getFullYear()};
  const last=evs[evs.length-1];
  return{...last,status:'DATES COMING',window:'ANNOUNCED EACH SPRING'};
}

function Header(){
  const camp=campWindow();
  if(NS.SiteNav)return <NS.SiteNav active="home" campNote={camp.status==='ENROLLING NOW'?'ENROLLING NOW':camp.window}
    links={{calendar:'../portal/index.html#calendar',store:'../portal/index.html#store',login:'../portal/index.html',juniors:'#programs',camps:'#camps',adults:'#programs',jtt:'#programs',book:'#book',logoSrc:'../../assets/logo-mark.svg'}}/>;
  return null;
}

function Hero(){
  const m=useMobile();
  return <section id="top" data-screen-label="Hero" style={{background:'var(--surface-page)'}}>
    <div style={{...container,display:'grid',gridTemplateColumns:m?'1fr':'1.05fr 0.95fr',gap:m?36:56,alignItems:'center',padding:m?'48px 16px 40px':'88px 32px 64px'}}>
      <div style={{display:'flex',flexDirection:'column',gap:28}}>
        <Eyebrow ticks>Cupertino · De Anza College &amp; Murdock Park</Eyebrow>
        <h1 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'clamp(2.375rem,4.6vw,4.5rem)',lineHeight:1.02,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Learn to see<br/>your own motion.</h1>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-lg)',lineHeight:1.55,color:'var(--text-secondary)',maxWidth:'46ch'}}>Tennis training for juniors and adults, one frame at a time — small groups, match play every week, and coaching centered on your comprehension.</p>
        <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          <Button href="#book">Book a free trial class</Button>
          <Button variant="ghost" href="#programs">Explore programs</Button>
        </div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.06em',color:'var(--text-secondary)',borderTop:'var(--hairline)',paddingTop:16}}>PTR-CERTIFIED COACHES · USTA JUNIOR TEAM TENNIS · SUMMER CAMPS AT DE ANZA COLLEGE</div>
      </div>
      <PhotoFrame src={P+'net-rally-l.jpg'} alt="Juniors rallying at the net on a blue hard court" ratio="4:3" treatment="slice" focal="50% 45%" tag="MURDOCK PARK" caption="Rallies &amp; games — green ball" captionRight="THU · t0 →"/>
    </div>
  </section>;
}

// ADMIN: film asset slot — placeholder until the real slow-mo loop is supplied
function Film(){
  const m=useMobile();
  const ann={position:'absolute',fontFamily:'var(--font-mono)',fontSize:m?'0.5625rem':'0.6875rem',letterSpacing:'0.07em',color:'var(--court-300)',textTransform:'uppercase'};
  return <section data-screen-label="Film" style={{background:'var(--surface-page)'}}>
    <div style={{...container,padding:m?'0 16px 56px':'0 32px 96px'}}>
      <div style={{position:'relative',aspectRatio:'16/9',background:'var(--court-900)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18,overflow:'hidden'}}>
        <span style={{...ann,top:14,left:16}}>PLACEHOLDER — CINEMATIC SLOW-MO FILM</span>
        <span style={{...ann,top:14,right:16,textAlign:'right'}}>16:9 · 0:40 LOOP · MUTED</span>
        {!m&&<span style={{...ann,bottom:14,left:16}}>SHOT LIST: SERVE FOLLOW-THROUGH · BALL AT CONTACT · SPLIT-STEP · 120 FPS</span>}
        <span style={{...ann,bottom:14,right:16}}>t0 →</span>
        <span aria-hidden="true" style={{height:48,padding:'0 28px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid var(--line-white)',color:'var(--line-white)',fontFamily:'var(--font-sans)',fontSize:'var(--size-label)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase'}}>Play the film</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.07em',color:'var(--court-200)',textAlign:'center',padding:'0 16px'}}>YOUR SWING AT 120 FPS — FOOTAGE IN PRODUCTION</span>
      </div>
    </div>
  </section>;
}

function Programs(){
  const m=useMobile();
  const camp=campWindow(); // ADMIN: seasonal event drives this banner
  return <section id="programs" data-screen-label="Programs" style={{background:'var(--surface-card)',borderTop:'var(--hairline)',padding:m?'56px 0 64px':'88px 0 96px'}}>
    <div style={{...container,padding:m?'0 16px':container.padding}}>
      <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:48}}>
        <Eyebrow ticks>Programs</Eyebrow>
        <h2 style={{...h2Style,color:'var(--ink)'}}>Classes. Team tennis.<br/>Private lessons.</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:m?'1fr':'repeat(3,1fr)',gap:24,alignItems:'stretch'}}>
        <ProgramCard eyebrow="Weekly" title="Classes" level="Orange → Yellow ball" location="De Anza · Murdock Park"
          photo={P+'racquets-up-l.jpg'} photoAlt="Junior players raising racquets" photoFocal="50% 42%"
          schedule={[{days:'Sat & Sun',time:'2h classes',detail:'De Anza'},{days:'Mon · Tue · Thu',time:'1.5h classes',detail:'Murdock'}]}
          note="Groups by ball level, juniors and adults. Every class runs the same three blocks — times are set by the academy each season."
          ctaLabel="See class times" ctaHref="../portal/index.html#calendar"/>
        <ProgramCard eyebrow="USTA JTT" title="Team tennis" level="Multiple Momentum teams" location="Bay Area league"
          photo={P+'champs-banner-l.jpg'} photoAlt="Momentum teams at a USTA Junior Team Tennis championship" photoFocal="50% 55%"
          schedule={[{days:'Fall & spring',time:'League season'},{days:'Matches',time:'Public schedule',detail:'Bay Area'}]}
          note="USTA Junior Team Tennis against some twenty Bay Area clubs. Competing is part of the curriculum, not a graduation from it."
          ctaLabel="JTT match schedule" ctaHref="#performance"/>
        <ProgramCard eyebrow="1-on-1" title="Private lessons" level="All levels" location="De Anza · Murdock Park"
          photo={P+'court-walk-l.jpg'} photoAlt="Players walking the court" photoFocal="50% 50%"
          schedule={[{days:'By appointment',time:'60 / 90 min'}]}
          note="One court, one player, one plan — most lessons taught by head coach Artur Westergren himself."
          ctaLabel="Ask about availability" ctaHref="#book"/>
      </div>
      <div id="camps" className="on-field" style={{marginTop:24,background:'var(--surface-field)',padding:m?'20px':'22px 28px',display:'flex',gap:m?14:28,alignItems:m?'flex-start':'center',justifyContent:'space-between',flexWrap:'wrap'}}>
        <div style={{display:'flex',flexDirection:'column',gap:6,flex:'1 1 320px',minWidth:260}}>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--court-300)'}}>Seasonal — {camp.label}</span>
          <span style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',lineHeight:1.5,color:'var(--text-on-field-dim)'}}>{camp.blurb}</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:m?'flex-start':'flex-end'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--line-white)'}}>{camp.window}</span>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',color:'var(--court-300)'}}>{camp.status} · 2ND WEEK OF JUNE – END OF JULY</span>
        </div>
      </div>
    </div>
  </section>;
}

function ClassSection(){
  const m=useMobile();
  return <section id="class" data-screen-label="Inside a class" className="on-field" style={{background:'var(--surface-field)',padding:m?'56px 0':'96px 0'}}>
    <div style={{...container,padding:m?'0 16px':container.padding,display:'grid',gridTemplateColumns:m?'1fr':'0.9fr 1.1fr',gap:m?32:56,alignItems:'center'}}>
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <Eyebrow onField>Inside a class</Eyebrow>
        <h2 style={{...h2Style,color:'var(--line-white)'}}>Play by play of your time on court.</h2>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body)',lineHeight:1.6,color:'var(--text-on-field-dim)',maxWidth:'44ch'}}>Every class runs the same three blocks — technique, applied drills, live play. The structure never changes; the work inside it does, layer by layer, across a four-year physical progression.</p>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.06em',color:'var(--text-on-field-dim)'}}>WEEKENDS 2H (40-MIN BLOCKS) · WEEKDAYS 1.5H (30-MIN BLOCKS) · TIMES SET BY THE ACADEMY EACH SEASON</div>
        <StrobeArc tone="field" annotate frames={8} height={150}/>
      </div>
      <div style={{background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'}}>
        {ClassTimeline?<ClassTimeline/>:<div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'var(--text-secondary)',padding:'24px 0'}}>CLASS TIMELINE — BUNDLE COMPILING, RELOAD IN A MOMENT.</div>}
      </div>
    </div>
  </section>;
}

// ADMIN: SITE_STATS record drives every number here
function Performance(){
  const m=useMobile();
  const S=SITE_STATS;
  const NUMC={field:'var(--line-white)',blue:'var(--line-white)',white:'var(--ink)'};
  const CAPC={field:'var(--court-300)',blue:'var(--court-050)',white:'var(--court-500)'};
  const STAMPC={field:'var(--court-200)',blue:'var(--court-050)',white:'var(--text-secondary)'};
  const RULEC={field:'rgba(247,247,247,0.25)',blue:'rgba(247,247,247,0.35)',white:'var(--border-hairline)'};
  const BG={field:'var(--court-800)',blue:'var(--court-500)',white:'var(--white)'};
  const num=(v,t)=><div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'clamp(2.75rem,4.2vw,3.75rem)',lineHeight:0.95,color:NUMC[t]}}>{v}</div>;
  const cap=(v,t)=><div style={{fontFamily:'var(--font-sans)',fontSize:'var(--size-label)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:CAPC[t],lineHeight:1.5}}>{v}</div>;
  const stamp=(t)=><div style={{marginTop:'auto',borderTop:'1px solid '+RULEC[t],paddingTop:10,fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.08em',color:STAMPC[t]}}>{S.range}</div>;
  const Card=({tone='white',children,style})=><div className={tone!=='white'?'on-field':undefined} style={{display:'flex',flexDirection:'column',gap:10,padding:'24px 24px 16px',minHeight:m?170:200,background:BG[tone],border:tone==='white'?'var(--hairline)':'1px solid transparent',boxSizing:'border-box',...style}}>{children}</div>;
  return <section id="performance" data-screen-label="Performance" style={{background:'var(--surface-page)',borderTop:'var(--hairline)',padding:m?'56px 0 64px':'88px 0 96px'}}>
    <div style={{...container,padding:m?'0 16px':container.padding}}>
      <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:48}}>
        <Eyebrow ticks>Results</Eyebrow>
        <h2 style={{...h2Style,color:'var(--ink)'}}>Sneak peek<br/>at our performance.</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:m?'1fr':'repeat(3,1fr)',gap:m?12:20}}>
        <Card tone="field"><img src="../../assets/logo-mark-field.svg" alt="" style={{height:36,alignSelf:'flex-start'}}/>{num(S.dualWins,'field')}{cap('Dual match wins','field')}{stamp('field')}</Card>
        <Card tone="blue">{num(S.leagues,'blue')}{cap('League championships','blue')}{stamp('blue')}</Card>
        <Card>{num(S.top3,'white')}{cap('Top 3 finishes','white')}{stamp('white')}</Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:m?'1fr':'1fr 2fr',gap:m?12:20,marginTop:m?12:20}}>
        <div style={{display:'flex',gap:24,alignItems:'center',padding:24,background:'var(--white)',border:'var(--hairline)'}}>
          <div role="img" aria-label={S.winPct+' percent overall winning percentage'} style={{width:m?116:132,height:m?116:132,borderRadius:'50%',background:'conic-gradient(var(--court-500) 0 '+S.winPct+'%, var(--court-100) '+S.winPct+'% 100%)',display:'grid',placeItems:'center',flex:'none'}}>
            <div style={{width:m?84:96,height:m?84:96,borderRadius:'50%',background:'var(--white)',display:'grid',placeItems:'center',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.625rem',color:'var(--ink)'}}>{S.winPct}%</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10,alignSelf:'stretch',flex:1}}>
            <div style={{marginTop:8}}>{cap('Overall winning percentage','white')}</div>
            {stamp('white')}
          </div>
        </div>
        <Card tone="field" style={{minHeight:0}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,flex:1}}>
            <div style={{display:'flex',flexDirection:'column',gap:10,borderRight:'1px solid rgba(247,247,247,0.25)',paddingRight:24}}>{num(S.seasons,'field')}{cap('Unique team seasons','field')}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>{num(S.ratio,'field')}{cap('Win / loss ratio','field')}</div>
          </div>
          {stamp('field')}
        </Card>
      </div>
      <div style={{marginTop:m?28:40,borderTop:'var(--hairline)',paddingTop:18,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.04em',lineHeight:1.7,color:'var(--text-secondary)'}}>COACHES — ARTUR WESTERGREN (HEAD COACH · PTR · EX-NORCAL TENNIS ACADEMY) · VISHAL (PTR) · ELSIO (USTA HIGH PERFORMANCE)</span>
        <Button variant="secondary" size="sm" href="#programs">JTT match schedule</Button>
      </div>
    </div>
  </section>;
}

function Quote(){
  return <section data-screen-label="Quote" style={{background:'var(--surface-tint)',borderTop:'var(--hairline)',padding:'80px 0'}}>
    <div style={{...container,maxWidth:900}}>
      <FrameTicks/>
      <blockquote style={{margin:'20px 0 0',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'clamp(1.75rem,3vw,2.5rem)',lineHeight:1.12,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>"If our students aren't improving — we aren't growing as coaches."</blockquote>
      <div style={{marginTop:18,fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.08em',color:'var(--text-secondary)'}}>ARTUR WESTERGREN · HEAD COACH</div>
    </div>
  </section>;
}

function CTABand(){
  return <section id="book" data-screen-label="Book" className="on-field" style={{background:'var(--surface-field-deep)',padding:'96px 0'}}>
    <div style={{...container,display:'flex',flexDirection:'column',gap:24,alignItems:'flex-start'}}>
      <img src="../../assets/logo-mark-field.svg" alt="" style={{height:84,display:'block'}}/>
      <h2 style={{...h2Style,fontSize:'clamp(2.25rem,3.6vw,3.25rem)',color:'var(--line-white)'}}>Book a free trial class.</h2>
      <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body)',lineHeight:1.6,color:'var(--text-on-field-dim)',maxWidth:'44ch'}}>One session on court with a PTR-certified coach. See where your game is now — and what the next frame looks like.</p>
      <div style={{display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
        <Button href="#book">Book a free trial class</Button>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--text-on-field-dim)'}}>CALL OR WHATSAPP · 669-264-6756</span>
      </div>
    </div>
  </section>;
}

function Footer(){
  const link={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--ink)',textDecoration:'none'};
  return <footer data-screen-label="Footer" style={{background:'var(--surface-page)',borderTop:'var(--hairline)',padding:'48px 0'}}>
    <div style={{...container,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:32,flexWrap:'wrap'}}>
      <img src="../../assets/logo.svg" alt="Momentum Tennis" style={{height:76,display:'block'}}/>
      <nav aria-label="Footer" style={{display:'flex',gap:24,flexWrap:'wrap'}}>
        <a style={link} href="#programs">Classes</a><a style={link} href="#programs">Team tennis</a><a style={link} href="#camps">Camps</a><a style={link} href="#performance">Performance</a><a style={link} href="#book">Contact</a>
      </nav>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.8,color:'var(--text-secondary)',textAlign:'right'}}>DE ANZA COLLEGE · 21250 STEVENS CREEK BLVD, CUPERTINO, CA<br/>MURDOCK PARK · CUPERTINO, CA<br/>© 2026 MOMENTUM TENNIS LLC</div>
    </div>
  </footer>;
}

function HomePage(){
  return <div style={{background:'var(--surface-page)'}}>
    <Header/><Hero/><Film/><Programs/><ClassSection/><Performance/><Quote/><CTABand/><Footer/>
  </div>;
}
Object.assign(window,{MTSections:{Header,Hero,Film,Programs,ClassSection,Performance,Quote,CTABand,Footer,HomePage}});

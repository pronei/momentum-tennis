const NS=window.MomentumTennisDesignSystem_0ea6ac||{};
const {Wordmark,StrobeArc,FrameTicks,Button,Eyebrow,PhotoFrame,ProgramCard,CampTimeline}=NS;
const P='../../assets/photos/';
const container={maxWidth:'var(--container,1200px)',margin:'0 auto',padding:'0 32px'};
const h2Style={margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h2)',lineHeight:1.04,letterSpacing:'0.012em',textTransform:'uppercase'};

function Header(){
  if(NS.SiteNav)return <NS.SiteNav active="home" links={{calendar:'#calendar',store:'#store',login:'#stats',juniors:'#programs',camps:'#camp-day',adults:'#programs',jtt:'#proof',book:'#book',logoSrc:window.__resources.logoMark}}/>;
  const link={fontFamily:'var(--font-sans)',fontSize:'var(--size-label)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--ink)',textDecoration:'none',padding:'6px 2px'};
  return <header data-screen-label="Header" style={{position:'sticky',top:0,zIndex:20,background:'rgba(247,247,247,0.94)',backdropFilter:'blur(6px)',borderBottom:'var(--hairline)'}}>
    <div style={{...container,display:'flex',alignItems:'center',justifyContent:'space-between',height:72}}>
      <a href="#top" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:12}} aria-label="Momentum Tennis home"><img src={window.__resources.logoMark} alt="" style={{height:42,display:'block'}}/><Wordmark variant="word" height={19}/></a>
      <nav aria-label="Primary" style={{display:'flex',gap:28,alignItems:'center'}}>
        <a style={link} href="#programs">Programs</a>
        <a style={link} href="#camp-day">Camps</a>
        <a style={link} href="#proof">Coaches</a>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'var(--text-secondary)'}}>669-264-6756</span>
        <Button variant="secondary" size="sm" href="#book">Book a trial</Button>
      </nav>
    </div>
  </header>;
}

function Hero(){
  return <section id="top" data-screen-label="Hero" style={{background:'var(--surface-page)'}}>
    <div style={{...container,display:'grid',gridTemplateColumns:'1.05fr 0.95fr',gap:56,alignItems:'center',padding:'88px 32px 96px'}}>
      <div style={{display:'flex',flexDirection:'column',gap:28}}>
        <Eyebrow ticks>Cupertino · De Anza College &amp; Murdock Park</Eyebrow>
        <h1 style={{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'clamp(3rem,4.6vw,4.5rem)',lineHeight:1.02,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink)'}}>Learn to see<br/>your own motion.</h1>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-lg)',lineHeight:1.55,color:'var(--text-secondary)',maxWidth:'46ch'}}>Tennis training for juniors and adults, one frame at a time — small groups, match play every week, and coaching centered on your comprehension.</p>
        <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
          <Button href="#book">Book a free trial class</Button>
          <Button variant="ghost" href="#programs">Explore programs</Button>
        </div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.06em',color:'var(--text-secondary)',borderTop:'var(--hairline)',paddingTop:16}}>PTR-CERTIFIED COACHES · USTA JUNIOR TEAM TENNIS · SUMMER CAMPS AT DE ANZA COLLEGE</div>
      </div>
      <PhotoFrame src={window.__resources.photoNetRally} alt="Juniors rallying at the net on a blue hard court" ratio="4:3" treatment="slice" focal="50% 45%" tag="MURDOCK PARK" caption="Rallies &amp; games — green ball" captionRight="THU 17:00 · t0 →"/>
    </div>
  </section>;
}

function Programs(){
  return <section id="programs" data-screen-label="Programs" style={{background:'var(--surface-card)',borderTop:'var(--hairline)',padding:'88px 0 96px'}}>
    <div style={container}>
      <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:48}}>
        <Eyebrow ticks>Programs</Eyebrow>
        <h2 style={{...h2Style,color:'var(--ink)'}}>Juniors. Camps. Adults.</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,alignItems:'stretch'}}>
        <ProgramCard eyebrow="Juniors" title="Classes & team tennis" level="Orange → Yellow ball" location="De Anza · Murdock Park"
          photo={window.__resources.photoRacquets} photoAlt="Junior players raising racquets" photoFocal="50% 42%"
          schedule={[{days:'Sat & Sun',time:'09:00–13:00',detail:'De Anza'},{days:'Mon · Tue · Thu',time:'16:00–20:00',detail:'Murdock'}]}
          note="Groups by ball level. USTA Junior Team Tennis — multiple Momentum teams with a public match schedule against Bay Area clubs."
          ctaLabel="Junior schedule" ctaHref="#junior"/>
        <ProgramCard eyebrow="Summer" title="Camps at De Anza" level="10U · 12U · 14U · 16U" location="De Anza College"
          photo={window.__resources.photoTeamWide} photoAlt="Camp group on court" photoFocal="50% 55%"
          schedule={[{days:'Mon – Fri',time:'09:00–17:00',detail:'Full day'},{days:'Mon – Fri',time:'09:00–13:00',detail:'Half day'},{days:'10 weeks',time:'Jun 9 – Aug 15'}]}
          note="Tennis all morning. Afternoons: chess, then music production, photography, art — in De Anza studios."
          ctaLabel="See the camp day" ctaHref="#camp-day"/>
        <ProgramCard eyebrow="Adults" title="Adult programs" level="Beginner → competitive" location="De Anza College"
          photo={window.__resources.photoCourtWalk} photoAlt="Players walking the court" photoFocal="50% 50%"
          schedule={[{days:'Sat & Sun',time:'Mornings'}]}
          note="Clinics and private coaching, personalized to your learning style. Schedule set each season."
          ctaLabel="Ask about clinics" ctaHref="#book"/>
      </div>
    </div>
  </section>;
}

function CampDay(){
  return <section id="camp-day" data-screen-label="Camp day" className="on-field" style={{background:'var(--surface-field)',padding:'96px 0'}}>
    <div style={{...container,display:'grid',gridTemplateColumns:'0.9fr 1.1fr',gap:56,alignItems:'center'}}>
      <div style={{display:'flex',flexDirection:'column',gap:24}}>
        <Eyebrow onField>A camp day</Eyebrow>
        <h2 style={{...h2Style,color:'var(--line-white)'}}>Mornings on court. Afternoons in the studio.</h2>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body)',lineHeight:1.6,color:'var(--text-on-field-dim)',maxWidth:'44ch'}}>The same discipline, five mediums. Players train technique and match play through the morning, then carry the habit of careful observation into chess, music production, photography and art.</p>
        <StrobeArc tone="field" annotate frames={8} height={150}/>
      </div>
      <div style={{background:'var(--surface-card)',border:'var(--hairline)',padding:'20px 24px'}}>
        <CampTimeline/>
      </div>
    </div>
  </section>;
}

function Proof(){
  const name={fontFamily:'var(--font-sans)',fontWeight:600,fontSize:'var(--size-body)',color:'var(--ink)'};
  const cred={fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'var(--text-secondary)',letterSpacing:'0.04em'};
  const row={display:'flex',flexDirection:'column',gap:2,padding:'12px 0',borderBottom:'var(--hairline)'};
  const colH={fontFamily:'var(--font-sans)',fontSize:'var(--size-label)',fontWeight:700,letterSpacing:'var(--track-label)',textTransform:'uppercase',color:'var(--court-500)',margin:0};
  return <section id="proof" data-screen-label="Proof" style={{background:'var(--surface-page)',borderTop:'var(--hairline)',padding:'88px 0 96px'}}>
    <div style={container}>
      <div style={{display:'flex',flexDirection:'column',gap:16,marginBottom:48}}>
        <Eyebrow ticks>Proof</Eyebrow>
        <h2 style={{...h2Style,color:'var(--ink)'}}>Credentials on court,<br/>results in matches.</h2>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1.2fr',gap:48,alignItems:'start'}}>
        <div><h3 style={colH}>Coaches</h3>
          <div style={row}><span style={name}>Artur Westergren</span><span style={cred}>HEAD COACH · PTR · EX-NORCAL TENNIS ACADEMY</span></div>
          <div style={row}><span style={name}>Vishal</span><span style={cred}>PTR</span></div>
          <div style={row}><span style={name}>Elsio</span><span style={cred}>USTA HIGH PERFORMANCE</span></div>
        </div>
        <div><h3 style={colH}>Team tennis</h3>
          <p style={{margin:'12px 0 16px',fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm)',lineHeight:1.6,color:'var(--text-secondary)'}}>Multiple Momentum teams play USTA Junior Team Tennis with a public match schedule against some twenty Bay Area clubs. Competing is part of the curriculum, not a graduation from it.</p>
          <Button variant="secondary" size="sm" href="#jtt">JTT match schedule</Button>
        </div>
        <PhotoFrame src={window.__resources.photoChamps} alt="Momentum teams at a USTA Junior Team Tennis championship" ratio="3:2" focal="50% 55%" tag="USTA JTT CHAMPIONSHIP" caption="Momentum teams, sectional championship" captionRight="BAY AREA"/>
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
      <img src={window.__resources.logoMarkField} alt="" style={{height:84,display:'block'}}/>
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
      <img src={window.__resources.logoFull} alt="Momentum Tennis" style={{height:76,display:'block'}}/>
      <nav aria-label="Footer" style={{display:'flex',gap:24,flexWrap:'wrap'}}>
        <a style={link} href="#programs">Classes</a><a style={link} href="#camp-day">Camps</a><a style={link} href="#jtt">JTT schedule</a><a style={link} href="#proof">Staff</a><a style={link} href="#book">Contact</a>
      </nav>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.8,color:'var(--text-secondary)',textAlign:'right'}}>DE ANZA COLLEGE · 21250 STEVENS CREEK BLVD, CUPERTINO, CA<br/>MURDOCK PARK · CUPERTINO, CA<br/>© 2026 MOMENTUM TENNIS LLC</div>
    </div>
  </footer>;
}

function HomePage(){
  return <div style={{background:'var(--surface-page)'}}>
    <Header/><Hero/><Programs/><CampDay/><Proof/><Quote/><CTABand/><Footer/>
  </div>;
}
Object.assign(window,{MTSections:{Header,Hero,Programs,CampDay,Proof,Quote,CTABand,Footer,HomePage}});

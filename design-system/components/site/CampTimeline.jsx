import React,{useState} from 'react';

const DEFAULT_ITEMS=[
  {time:'09:00',title:'On-court training & technique',desc:'Footwork, grip, swing shape — small groups by ball level.',phase:'On court'},
  {time:'09:45',title:'Rallies & games',phase:'On court'},
  {time:'10:45',title:'Match play & strategy',desc:'USTA team-tennis formats, point construction, scoring.',phase:'On court'},
  {time:'13:00',title:'Chess & mental development',phase:'Mind'},
  {time:'14:30',title:'Music production, photography, art & crafts',desc:'Creative studios at De Anza College, to 17:00.',phase:'Studio'},
];
const CHIP_RAMP=['#DCE6EE','#A9BDC9','#7FA3C4','#3E6C99','#2B5680','#24466B','#1C3655'];

/* The camp day as a strobe sequence: frames deepen as the day advances; the frame under your cursor is "now". */
export function CampTimeline({items=DEFAULT_ITEMS,style}){
  const [now,setNow]=useState(-1);
  const n=items.length;
  return React.createElement('ol',{style:{listStyle:'none',margin:0,padding:0,position:'relative',...style}},
    items.map((it,i)=>{
      const chipBg=CHIP_RAMP[Math.min(CHIP_RAMP.length-1,Math.round(i/(n-1)*(CHIP_RAMP.length-1)))];
      const lightChip=i/(n-1)<0.45;
      const active=now===i;
      return React.createElement('li',{key:i,tabIndex:0,
        onMouseEnter:()=>setNow(i),onMouseLeave:()=>setNow(-1),onFocus:()=>setNow(i),onBlur:()=>setNow(-1),
        style:{display:'grid',gridTemplateColumns:'56px 40px 1fr',gap:'0 18px',alignItems:'start',position:'relative',padding:'14px 8px',cursor:'default',outlineOffset:2,background:active?'var(--surface-tint,#EEF3F7)':'transparent',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)'}},
        i<n-1&&React.createElement('span',{'aria-hidden':true,style:{position:'absolute',left:56+18+19,top:54,bottom:-14,width:1,background:'var(--border-hairline,rgba(27,27,27,0.16))'}}),
        React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--text-secondary,#46525E)',paddingTop:11}},it.time),
        React.createElement('span',{'aria-hidden':true,style:{width:40,height:40,display:'grid',placeItems:'center',fontFamily:'var(--font-mono)',fontSize:'0.8125rem',fontWeight:600,background:active?'var(--now,#E8A33D)':chipBg,color:active?'var(--ink,#1B1B1B)':lightChip?'var(--court-800,#1C3655)':'var(--line-white,#F7F7F7)',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)',position:'relative',zIndex:1}},String(i+1).padStart(2,'0')),
        React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:3,paddingTop:8}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',gap:16,alignItems:'baseline'}},
            React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body,1rem)',fontWeight:600,color:'var(--ink,#1B1B1B)'}},it.title),
            it.phase&&React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.107em',textTransform:'uppercase',color:active?'var(--accent-present-hover,#C77F14)':'var(--court-400,#3E6C99)',whiteSpace:'nowrap',transition:'color var(--dur-fast,120ms) var(--ease-out,ease)'}},it.phase)
          ),
          it.desc&&React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.5,color:'var(--text-secondary,#46525E)',maxWidth:'52ch'}},it.desc)
        )
      );
    })
  );
}

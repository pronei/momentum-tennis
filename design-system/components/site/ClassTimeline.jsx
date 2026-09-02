import React,{useState} from 'react';

const DEFAULT_BLOCKS=[
  {title:'Technical skill training',desc:'Footwork, grip, swing shape — one element isolated and repeated until you can see it.'},
  {title:'Dynamic drills & skill application',desc:'The same technique under movement and pressure: live feeds, patterns, decision speed.'},
  {title:'Gameplay & strategy',desc:'Point construction, scoring, match habits — the skill applied where it counts.'}
];
const CHIPS=['#A9BDC9','#3E6C99','#1C3655'];

/* One class, play by play: three equal blocks. Weekends run 2h (40-min blocks), weekdays 1.5h (30-min).
   Wall-clock start times are set by the academy (admin console) — the timeline shows offsets, not clock times. */
export function ClassTimeline({variant='weekend',showToggle=true,blocks=DEFAULT_BLOCKS,style}){
  const [v,setV]=useState(variant);
  const [now,setNow]=useState(-1);
  const per=v==='weekend'?40:30;
  const off=(i)=>{const t=i*per;return 'T+'+Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};
  const segBtn=(key,label)=>React.createElement('button',{key,onClick:()=>setV(key),'aria-pressed':v===key,style:{
    height:40,padding:'0 16px',border:v===key?'1px solid var(--ink,#1B1B1B)':'1px solid var(--border-hairline,rgba(27,27,27,0.16))',
    background:v===key?'var(--court-050,#EEF3F7)':'transparent',cursor:'pointer',fontFamily:'var(--font-mono)',
    fontSize:'0.6875rem',letterSpacing:'0.08em',fontWeight:v===key?600:400,color:'var(--ink,#1B1B1B)',textTransform:'uppercase',borderRadius:0}},label);
  return React.createElement('div',{style},
    showToggle&&React.createElement('div',{role:'group','aria-label':'Class length',style:{display:'flex',gap:8,marginBottom:8}},
      segBtn('weekend','Weekend · 2h'),segBtn('weekday','Weekday · 1.5h')),
    React.createElement('ol',{style:{listStyle:'none',margin:0,padding:0}},
      blocks.map((b,i)=>{
        const active=now===i;
        return React.createElement('li',{key:i,tabIndex:0,onMouseEnter:()=>setNow(i),onMouseLeave:()=>setNow(-1),onFocus:()=>setNow(i),onBlur:()=>setNow(-1),
          style:{display:'grid',gridTemplateColumns:'58px 40px 1fr',gap:'0 16px',alignItems:'start',position:'relative',padding:'14px 8px',background:active?'var(--surface-tint,#EEF3F7)':'transparent',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)',outlineOffset:2}},
          i<blocks.length-1&&React.createElement('span',{'aria-hidden':true,style:{position:'absolute',left:58+16+19,top:54,bottom:-14,width:1,background:'var(--border-hairline,rgba(27,27,27,0.16))'}}),
          React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--text-secondary,#46525E)',paddingTop:11}},off(i)),
          React.createElement('span',{'aria-hidden':true,style:{width:40,height:40,display:'grid',placeItems:'center',fontFamily:'var(--font-mono)',fontSize:'0.8125rem',fontWeight:600,background:active?'var(--now,#E8A33D)':CHIPS[i]||CHIPS[2],color:active?'var(--ink,#1B1B1B)':i===0?'var(--court-800,#1C3655)':'var(--line-white,#F7F7F7)',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)',position:'relative',zIndex:1}},String(i+1).padStart(2,'0')),
          React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:3,paddingTop:8}},
            React.createElement('div',{style:{display:'flex',justifyContent:'space-between',gap:16,alignItems:'baseline'}},
              React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body,1rem)',fontWeight:600,color:'var(--ink,#1B1B1B)'}},b.title),
              React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.107em',textTransform:'uppercase',color:active?'var(--accent-present-hover,#C77F14)':'var(--court-400,#3E6C99)',whiteSpace:'nowrap'}},per+' MIN')
            ),
            b.desc&&React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.5,color:'var(--text-secondary,#46525E)',maxWidth:'52ch'}},b.desc)
          )
        );
      })
    ),
    React.createElement('div',{style:{borderTop:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',marginTop:4,paddingTop:12,fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.07em',color:'var(--text-secondary,#46525E)',textTransform:'uppercase'}},
      '3 blocks · '+per+' min each · '+(v==='weekend'?'2h — weekends':'1.5h — weekdays')+' · times set by the academy')
  );
}

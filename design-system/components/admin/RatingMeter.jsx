import React from 'react';
const h=React.createElement;
const RAMP=['var(--court-100,#DCE6EE)','var(--court-200,#A9BDC9)','var(--court-300,#7FA3C4)','var(--court-400,#3E6C99)','var(--court-700,#24466B)'];

/* CourtMeter generalized to N dimensions: one row per dimension — caps label (+ INTERNAL tag),
   segments (climbed cool / current amber / ahead empty), always-visible mono value "3 OF 5",
   optional trend annotation. The text value is the accessibility guarantee — never color alone.
   interactive mode turns segments into 44px-tall input buttons (coach rating entry). */
export function RatingMeter({dimensions=[],max=5,tone='light',interactive=false,onChange,style}){
  const field=tone==='field';
  const segRow=(d,di)=>{
    const v=Math.max(0,Math.min(max,d.value||0));
    return h('div',{key:di,style:{display:'flex',flexDirection:'column',gap:8}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:12,flexWrap:'wrap'}},
        h('span',{style:{display:'inline-flex',alignItems:'center',gap:10}},
          h('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm,.75rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:field?'var(--text-on-field-dim,#A9BDC9)':'var(--text-secondary,#46525E)'}},d.label),
          d.internal&&h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.5625rem',letterSpacing:'0.08em',padding:'2px 6px',border:'1px solid '+(field?'var(--border-on-field,rgba(247,247,247,0.24))':'var(--border-hairline,rgba(27,27,27,0.16))'),color:field?'var(--court-300,#7FA3C4)':'var(--court-400,#3E6C99)'}},'INTERNAL')),
        h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.05em',color:field?'var(--text-on-field-dim,#A9BDC9)':'var(--text-secondary,#46525E)'}},
          v+' OF '+max,d.trend?h('span',{style:{color:field?'var(--amber-300,#F2C377)':'var(--accent-present-hover,#C77F14)',marginLeft:10}},d.trend):null)),
      h('div',{role:interactive?'group':'meter','aria-label':d.label+(interactive?'':': '+v+' of '+max),
        'aria-valuemin':interactive?undefined:1,'aria-valuemax':interactive?undefined:max,'aria-valuenow':interactive?undefined:v,
        style:{display:'flex',gap:6}},
        Array.from({length:max},(_,i)=>{
          const n=i+1;
          const bg=n<v?RAMP[Math.min(RAMP.length-1,i)]:n===v?'var(--now,#E8A33D)':'transparent';
          const border=n>v?'1px solid '+(field?'var(--border-on-field,rgba(247,247,247,0.24))':'var(--border-hairline,rgba(27,27,27,0.16))'):'1px solid transparent';
          if(!interactive)return h('div',{key:i,style:{flex:1,height:16,background:bg,border,boxSizing:'border-box',transition:'background var(--dur-base,200ms) var(--ease-out,ease)'}});
          return h('button',{key:i,type:'button','aria-label':d.label+': set '+n+' of '+max,'aria-pressed':n===v,
            onClick:()=>onChange&&onChange(di,n),
            style:{flex:1,height:44,minWidth:44,background:bg,border:n>v?border:'1px solid transparent',boxSizing:'border-box',cursor:'pointer',borderRadius:0,padding:0,transition:'background var(--dur-fast,120ms) var(--ease-out,ease)'}});})),
      d.note&&h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.05em',color:field?'var(--court-300,#7FA3C4)':'var(--text-secondary,#46525E)'}},d.note));
  };
  return h('div',{style:{display:'flex',flexDirection:'column',gap:20,...style}},dimensions.map(segRow));
}

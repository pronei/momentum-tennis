import React from 'react';

const RAMP=['#DCE6EE','#A9BDC9','#7FA3C4','#3E6C99','#24466B'];

/* The loyalty / progression meter: five courts ordered by difficulty. Courts climbed are cool
   (the past), the court the player stands on today is amber (now), courts ahead are empty frames. */
export function CourtMeter({court=3,max=5,label='Court level',caption,tone='light',showLabels=true,style}){
  const onField=tone==='field';
  const cur=Math.max(1,Math.min(max,court));
  return React.createElement('div',{role:'meter','aria-valuemin':1,'aria-valuemax':max,'aria-valuenow':cur,'aria-label':`${label}: court ${cur} of ${max}`,style:{display:'flex',flexDirection:'column',gap:8,...style}},
    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:16}},
      React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm,.75rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:onField?'var(--text-on-field-dim,#A9BDC9)':'var(--text-secondary,#46525E)'}},label),
      caption&&React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.05em',textTransform:'uppercase',color:onField?'var(--text-on-field-dim,#A9BDC9)':'var(--court-500,#2B5680)'}},caption)
    ),
    React.createElement('div',{style:{display:'flex',gap:6}},
      Array.from({length:max},(_,i)=>{
        const n=i+1;
        const bg=n<cur?RAMP[Math.min(RAMP.length-1,i)]:n===cur?'var(--now,#E8A33D)':'transparent';
        return React.createElement('div',{key:i,style:{flex:1,height:16,background:bg,border:n>cur?'1px solid var(--border-hairline,rgba(27,27,27,0.16))':'1px solid transparent',boxSizing:'border-box',transition:'background var(--dur-base,200ms) var(--ease-out,ease)'}});
      })
    ),
    showLabels&&React.createElement('div',{style:{display:'flex',gap:6}},
      Array.from({length:max},(_,i)=>React.createElement('span',{key:i,style:{flex:1,textAlign:'center',fontFamily:'var(--font-mono)',fontSize:'0.625rem',letterSpacing:'0.08em',color:i+1===cur?(onField?'var(--amber-300,#F2C377)':'var(--accent-present-hover,#C77F14)'):onField?'var(--court-300,#7FA3C4)':'var(--text-secondary,#46525E)',fontWeight:i+1===cur?600:400}},'C'+(i+1)))
    )
  );
}

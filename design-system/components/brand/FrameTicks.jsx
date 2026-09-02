import React from 'react';

/* Micro-device derived from the strobe: a row of frames, the active one warm. List marker, divider, loading state. */
export function FrameTicks({count=5,size=8,gap=5,tone='light',active='last',loading=false,style}){
  const cool=tone==='field'?['#3E6C99','#5B84AC','#7FA3C4','#A9BDC9']:['#DCE6EE','#A9BDC9','#7FA3C4','#3E6C99'];
  const activeIdx=active==='none'?-1:active==='last'?count-1:active;
  if(typeof document!=='undefined'&&!document.getElementById('mt-ticks-kf')){
    const s=document.createElement('style');s.id='mt-ticks-kf';
    s.textContent='@keyframes mt-tick-cycle{0%,25%{background:#E8A33D}30%,100%{background:#A9BDC9}}';
    document.head.appendChild(s);
  }
  return React.createElement('span',{style:{display:'inline-flex',gap,alignItems:'center',...style},'aria-hidden':!loading,role:loading?'status':undefined,'aria-label':loading?'Loading':undefined},
    Array.from({length:count},(_,i)=>React.createElement('span',{key:i,style:{
      width:size,height:size,display:'inline-block',
      background:i===activeIdx&&!loading?'var(--now,#E8A33D)':cool[Math.min(cool.length-1,Math.floor(i/count*cool.length))],
      animation:loading?`mt-tick-cycle ${count*0.32}s ${i*0.32}s infinite`:undefined
    }}))
  );
}

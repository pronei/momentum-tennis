import React from 'react';

/* The signature: stroboscopic bounce — motion as frozen instants. Ghost frames cool, present frame warm. */
export function StrobeArc({frames=8,tone='light',showPath=true,annotate=false,ballRadius=7,width='100%',height,style}){
  const W=640,H=200,pad=16,ground=H-16;
  const bounces=[{x0:0,x1:0.46,peak:0.8},{x0:0.46,x1:0.78,peak:0.44},{x0:0.78,x1:1.001,peak:0.21}];
  const yAt=(t)=>{const b=bounces.find(b=>t>=b.x0&&t<b.x1)||bounces[2];const u=(t-b.x0)/(b.x1-b.x0);return ground-4*u*(1-u)*b.peak*(ground-14);};
  const xAt=(t)=>pad+t*(W-2*pad);
  const n=Math.max(3,frames);
  const pts=Array.from({length:n},(_,i)=>{const t=i/(n-1);return{x:xAt(t),y:yAt(t)};});
  const cool=tone==='field'?['#3E6C99','#5B84AC','#7FA3C4','#A9BDC9','#DCE6EE']:['#DCE6EE','#A9BDC9','#7FA3C4','#3E6C99','#2B5680'];
  const colorAt=(i)=>i===n-1?'var(--now,#E8A33D)':cool[Math.min(cool.length-1,Math.floor(i/(n-1)*cool.length))];
  const dense=Array.from({length:81},(_,i)=>{const t=i/80;return`${xAt(t).toFixed(1)},${yAt(t).toFixed(1)}`;}).join(' ');
  const lineCol=tone==='field'?'rgba(247,247,247,0.28)':'rgba(27,27,27,0.22)';
  return React.createElement('svg',{viewBox:`0 0 ${W} ${H}`,width,height,style:{display:'block',...style},role:'img','aria-label':'Ball trajectory rendered as a stroboscopic sequence: past frames cool blue, the present frame warm amber'},
    showPath&&React.createElement('polyline',{points:dense,fill:'none',stroke:lineCol,strokeWidth:1,strokeDasharray:'1 5'}),
    showPath&&React.createElement('line',{x1:pad,y1:ground+ballRadius+2,x2:W-pad,y2:ground+ballRadius+2,stroke:lineCol,strokeWidth:1}),
    pts.map((p,i)=>React.createElement('circle',{key:i,cx:p.x,cy:p.y,r:i===n-1?ballRadius+1:ballRadius,fill:colorAt(i)})),
    annotate&&pts.map((p,i)=>React.createElement('text',{key:'t'+i,x:p.x,y:ground+ballRadius+16,textAnchor:'middle',fontFamily:'var(--font-mono)',fontSize:10,fill:tone==='field'?'var(--text-on-field-dim,#A9BDC9)':'var(--text-secondary,#46525E)'},i===n-1?'t0':`t\u2212${n-1-i}`))
  );
}

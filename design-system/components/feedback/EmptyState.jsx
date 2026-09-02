import React from 'react';
import {FrameTicks} from '../brand/FrameTicks.jsx';
const h=React.createElement;

/* The mono-line empty convention codified (NO SESSIONS — COURTS REST ON WED & FRI). */
export function EmptyState({children,ticks=false,action,style}){
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'40px 24px',textAlign:'center',...style}},
    ticks&&h(FrameTicks,{active:'none'}),
    h('p',{style:{margin:0,fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.7,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--text-secondary,#46525E)',maxWidth:'44ch'}},children),
    action&&h('div',null,action));
}

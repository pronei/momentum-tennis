import React from 'react';
import {FrameTicks} from '../brand/FrameTicks.jsx';

/* The speaking voice: uppercase, 13px, 0.107em. Optionally led by frame ticks. */
export function Eyebrow({children,onField=false,ticks=false,style}){
  return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:onField?'var(--text-on-field-dim,#A9BDC9)':'var(--court-500,#2B5680)',...style}},
    ticks&&React.createElement(FrameTicks,{size:7,tone:onField?'field':'light'}),
    React.createElement('span',null,children)
  );
}

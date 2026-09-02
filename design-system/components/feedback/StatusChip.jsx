import React from 'react';
const h=React.createElement;
const MAP={
  'ACTIVE':{sw:'var(--now,#E8A33D)'},
  'UPCOMING':{sw:'var(--court-300,#7FA3C4)'},
  'WAITLISTED':{sw:'var(--court-200,#A9BDC9)'},
  'CANCELLED':{sw:'transparent',frame:true,dim:true},
  'PAID':{sw:'var(--court-500,#2B5680)'},
  'REFUNDED':{sw:'var(--court-100,#DCE6EE)',frame:true},
  'SIGNED':{sw:'var(--court-800,#1C3655)'},
  'NEEDS RE-CONSENT':{sw:'var(--state-error,#A8432D)'},
  'PUBLISHED':{sw:'var(--court-800,#1C3655)'},
  'DRAFT':{sw:'transparent',frame:true,dim:true},
  'EXPIRED':{sw:'transparent',frame:true,dim:true}
};

/* The mono-caps status convention codified: leading 8px square swatch + mono text.
   The TEXT carries the meaning (always ink / secondary — AA everywhere); the swatch carries the color.
   Amber appears only in the ACTIVE swatch, never as status text (the old amber ACTIVE text failed AA). */
export function StatusChip({status='',tone='light',style}){
  const k=String(status).toUpperCase();
  const c=MAP[k]||{sw:'transparent',frame:true};
  const field=tone==='field';
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,whiteSpace:'nowrap',
    fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.07em',textTransform:'uppercase',lineHeight:1,
    color:c.dim?(field?'var(--court-300,#7FA3C4)':'var(--text-secondary,#46525E)'):(field?'var(--line-white,#F7F7F7)':'var(--ink,#1B1B1B)'),...style}},
    h('span',{'aria-hidden':true,style:{width:8,height:8,flex:'none',background:c.sw,boxSizing:'border-box',
      border:c.frame?'1px solid '+(field?'var(--border-on-field,rgba(247,247,247,0.24))':'rgba(27,27,27,0.4)'):'none'}}),
    k);
}

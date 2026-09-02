import React from 'react';
const h=React.createElement;

/* Inline square hairline strip with a mono prefix (ERROR: / NOTE:) — form-level and page-level states.
   Errors are dual-channel by construction: the color AND the prefix. */
export function Banner({tone='note',children,action,onField=false,style}){
  const err=tone==='error';
  return h('div',{role:err?'alert':'status',style:{
    display:'flex',gap:16,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',
    padding:'12px 16px',background:onField?'transparent':'var(--white,#fff)',
    border:'1px solid '+(err?'var(--state-error,#A8432D)':onField?'var(--border-on-field,rgba(247,247,247,0.24))':'var(--border-hairline,rgba(27,27,27,0.16))'),...style}},
    h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.6,letterSpacing:'0.05em',textTransform:'uppercase',
      color:err?'var(--state-error,#A8432D)':onField?'var(--text-on-field-dim,#A9BDC9)':'var(--text-secondary,#46525E)'}},
      h('b',{style:{fontWeight:600}},err?'ERROR: ':'NOTE: '),children),
    action&&h('span',{style:{flex:'none'}},action));
}

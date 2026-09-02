import React from 'react';
import {Eyebrow} from '../core/Eyebrow.jsx';
const h=React.createElement;

/* Groups fields under an eyebrow + hairline rule. The building block of every settings/admin form. */
export function FormSection({eyebrow,ticks=false,description,children,style}){
  return h('section',{style:{display:'flex',flexDirection:'column',gap:20,...style}},
    h('div',{style:{borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',paddingBottom:12,display:'flex',flexDirection:'column',gap:8}},
      eyebrow&&h(Eyebrow,{ticks},eyebrow),
      description&&h('p',{style:{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.55,color:'var(--text-secondary,#46525E)',maxWidth:'52ch'}},description)),
    h('div',{style:{display:'flex',flexDirection:'column',gap:16}},children));
}

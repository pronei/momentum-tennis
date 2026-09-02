import React from 'react';
const h=React.createElement;
const pad=n=>String(n).padStart(2,'0');

/* Mono 01 / 04 with typographic ghost prev/next. */
export function Pagination({page=1,pages=1,onChange,style}){
  const btn=(dir,lab,disabled)=>h('button',{type:'button','aria-label':lab,disabled,onClick:()=>onChange&&onChange(page+dir),
    style:{width:44,height:44,background:'none',border:'none',cursor:disabled?'default':'pointer',opacity:disabled?0.35:1,
      fontFamily:'var(--font-mono)',fontSize:'0.9375rem',color:'var(--ink,#1B1B1B)',borderRadius:0}},dir<0?'\u2190':'\u2192');
  return h('nav',{'aria-label':'Pagination',style:{display:'inline-flex',alignItems:'center',gap:8,...style}},
    btn(-1,'Previous page',page<=1),
    h('span',{'aria-live':'polite',style:{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.07em',color:'var(--text-secondary,#46525E)'}},pad(page)+' / '+pad(pages)),
    btn(1,'Next page',page>=pages));
}

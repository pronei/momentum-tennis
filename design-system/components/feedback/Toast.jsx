import React,{useEffect} from 'react';
const h=React.createElement;
function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-toast-kf'))return;
  const s=document.createElement('style');s.id='mt-toast-kf';
  s.textContent='@keyframes mt-toast-in{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}';
  document.head.appendChild(s);
}

/* Bottom toast: square ink strip, mono message, auto-dismiss. Entry is one short settle;
   the global reduced-motion rule makes it instant. */
export function Toast({open,children,onDismiss,duration=4000,style}){
  ensureStyles();
  useEffect(()=>{
    if(!open||!onDismiss||!duration)return;
    const t=setTimeout(onDismiss,duration);
    return()=>clearTimeout(t);
  },[open,duration]);
  if(!open)return null;
  return h('div',{role:'status',style:{
    position:'fixed',left:'50%',bottom:24,transform:'translate(-50%,0)',zIndex:60,
    display:'flex',alignItems:'center',gap:16,padding:'14px 18px',maxWidth:'min(560px, calc(100vw - 32px))',boxSizing:'border-box',
    background:'var(--ink,#1B1B1B)',color:'var(--line-white,#F7F7F7)',
    fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.05em',textTransform:'uppercase',
    animation:'mt-toast-in var(--dur-base,200ms) var(--ease-out,ease)',...style}},
    h('span',null,children),
    onDismiss&&h('button',{onClick:onDismiss,'aria-label':'Dismiss',style:{width:32,height:32,margin:'-8px -10px -8px 0',background:'none',border:'none',cursor:'pointer',color:'var(--line-white,#F7F7F7)',fontFamily:'var(--font-mono)',fontSize:'1rem'}},'\u00D7'));
}

import React,{useState,useEffect} from 'react';
const h=React.createElement;
function useMobile(){
  const [m,setM]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches);
  useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}

/* The portal's tab pair as one component: desktop = underline tab row on a hairline;
   ≤760px = fixed bottom bar with the amber top border marking "now" (or a scrollable top row
   for >5 admin-density tabs via mobileMode="scroll"). */
export function Tabs({items=[],active,onChange,mobileMode='bottom',ariaLabel='Sections',style}){
  const m=useMobile();
  const list=items.map(t=>typeof t==='object'?t:{id:t,label:t});
  if(m&&mobileMode==='bottom')return h('nav',{'aria-label':ariaLabel,style:{position:'fixed',left:0,right:0,bottom:0,zIndex:30,display:'flex',background:'rgba(247,247,247,0.96)',backdropFilter:'blur(8px)',borderTop:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',paddingBottom:'env(safe-area-inset-bottom)',...style}},
    list.map(t=>h('button',{key:t.id,'aria-current':active===t.id?'page':undefined,onClick:()=>onChange&&onChange(t.id),
      style:{flex:1,minHeight:56,background:'none',border:'none',borderTop:active===t.id?'2px solid var(--now,#E8A33D)':'2px solid transparent',cursor:'pointer',
        fontFamily:'var(--font-mono)',fontSize:'0.625rem',letterSpacing:'0.07em',textTransform:'uppercase',
        color:active===t.id?'var(--ink,#1B1B1B)':'var(--ink-secondary,#46525E)',fontWeight:active===t.id?600:400,padding:'0 2px'}},t.label)));
  return h('nav',{'aria-label':ariaLabel,style:{display:'flex',gap:m?20:26,borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',
    ...(m?{overflowX:'auto',WebkitOverflowScrolling:'touch'}:null),...style}},
    list.map(t=>h('button',{key:t.id,'aria-current':active===t.id?'page':undefined,onClick:()=>onChange&&onChange(t.id),
      style:{background:'none',border:'none',cursor:'pointer',padding:'0 2px 12px',whiteSpace:'nowrap',
        fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',
        color:active===t.id?'var(--ink,#1B1B1B)':'var(--ink-secondary,#46525E)',
        borderBottom:active===t.id?'2px solid var(--ink,#1B1B1B)':'2px solid transparent',marginBottom:-1}},t.label)));
}

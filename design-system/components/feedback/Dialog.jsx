import React,{useEffect,useRef,useState} from 'react';
const h=React.createElement;
function useMobile(){
  const [m,setM]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches);
  useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}

/* Modal: desktop = centered square card on the court-navy 55% backdrop; ≤760px = the bottom-sheet pattern.
   Focus trap, Esc, × close. Confirm: max ONE amber action per dialog; destructive confirms use a
   secondary outlined button with --state-error text + a mono consequence line — amber never confirms deletion. */
export function Dialog({open,onClose,title,children,actions,consequence,width=520,label,style}){
  const m=useMobile();
  const panel=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const prevFocus=document.activeElement;
    const prevOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const t=setTimeout(()=>{if(panel.current){const f=panel.current.querySelector('a,button,input,select,textarea,[tabindex]');(f||panel.current).focus();}},0);
    const key=(e)=>{
      if(e.key==='Escape'){onClose&&onClose();return;}
      if(e.key!=='Tab'||!panel.current)return;
      const f=[...panel.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')];
      if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',key);
    return()=>{clearTimeout(t);document.body.style.overflow=prevOverflow;document.removeEventListener('keydown',key);prevFocus&&prevFocus.focus&&prevFocus.focus();};
  },[open]);
  if(!open)return null;
  const sheet=m;
  return h(React.Fragment,null,
    h('div',{onClick:onClose,style:{position:'fixed',inset:0,background:'rgba(18,37,59,0.55)',zIndex:50}}),
    h('div',{ref:panel,role:'dialog','aria-modal':true,'aria-label':label||title,tabIndex:-1,
      style:sheet?{position:'fixed',left:0,right:0,bottom:0,zIndex:51,background:'var(--white,#fff)',borderTop:'2px solid var(--ink,#1B1B1B)',maxHeight:'72vh',overflowY:'auto',padding:'16px 16px calc(24px + env(safe-area-inset-bottom))',outline:'none',...style}
      :{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:51,background:'var(--white,#fff)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',width:'min('+width+'px, calc(100vw - 48px))',maxHeight:'80vh',overflowY:'auto',padding:24,boxSizing:'border-box',outline:'none',...style}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,marginBottom:14}},
        title?h('h2',{style:{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.375rem',lineHeight:1.1,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink,#1B1B1B)'}},title):h('span'),
        onClose&&h('button',{onClick:onClose,'aria-label':'Close',style:{width:44,height:44,margin:'-10px -12px 0 0',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'1.25rem',color:'var(--ink,#1B1B1B)'}},'\u00D7')),
      children,
      consequence&&h('div',{style:{marginTop:16,fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.6,letterSpacing:'0.04em',textTransform:'uppercase',color:'var(--state-error,#A8432D)'}},consequence),
      actions&&h('div',{style:{display:'flex',gap:12,justifyContent:'flex-end',flexWrap:'wrap',marginTop:20}},actions)));
}

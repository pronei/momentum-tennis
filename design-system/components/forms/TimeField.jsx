import React,{useState,useRef,useEffect} from 'react';
const h=React.createElement;
const LBL={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
const HELP={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'};
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};
const pad=n=>String(n).padStart(2,'0');
const toMin=(s)=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?(+m[1])*60+(+m[2]):null;};
const toStr=(mi)=>pad(Math.floor(((mi%1440)+1440)%1440/60))+':'+pad(((mi%1440)+1440)%1440%60);

/* Time input: mono 24h value (16:00). Arrow keys step ±step minutes; ▾ opens a slot list (court hours). */
export function TimeField({label,help,error,value,defaultValue,onChange,step=15,listStep=30,from='07:00',to='21:00',disabled=false,name,style}){
  const [own,setOwn]=useState(defaultValue||'');
  const cur=value!==undefined?value:own;
  const [open,setOpen]=useState(false);
  const wrap=useRef(null),inp=useRef(null);
  const ids=useRef(null);if(!ids.current)ids.current='mtt'+Math.random().toString(36).slice(2,7);
  useEffect(()=>{
    if(!open)return;
    const away=(e)=>{if(wrap.current&&!wrap.current.contains(e.target))setOpen(false);};
    const esc=(e)=>{if(e.key==='Escape'){setOpen(false);inp.current&&inp.current.focus();}};
    document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);};
  },[open]);
  const commit=(v)=>{if(value===undefined)setOwn(v);onChange&&onChange(v);};
  const onKey=(e)=>{
    if(e.key!=='ArrowUp'&&e.key!=='ArrowDown')return;
    const m=toMin(cur);if(m===null)return;e.preventDefault();
    commit(toStr(m+(e.key==='ArrowUp'?step:-step)));
  };
  const slots=[];const a=toMin(from),b=toMin(to);
  for(let t=a;t<=b;t+=listStep)slots.push(toStr(t));
  return h('div',{ref:wrap,style:{display:'flex',flexDirection:'column',gap:8,position:'relative',...style}},
    label&&h('label',{htmlFor:ids.current,style:LBL},label),
    h('span',{style:{position:'relative',display:'block'}},
      h('input',{id:ids.current,ref:inp,type:'text',name,placeholder:'HH:MM',maxLength:5,disabled,autoComplete:'off',
        value:cur,onChange:(e)=>commit(e.target.value),onKeyDown:onKey,
        'aria-invalid':error?true:undefined,'aria-describedby':(help||error)?[help?ids.current+'-help':null,error?ids.current+'-err':null].filter(Boolean).join(' '):undefined,
        style:{width:'100%',boxSizing:'border-box',height:48,padding:'0 58px 0 14px',background:'var(--white,#fff)',
          border:'1px solid '+(error?'var(--state-error,#A8432D)':'var(--border-hairline,rgba(27,27,27,0.16))'),borderRadius:0,
          fontFamily:'var(--font-mono)',fontSize:'0.9375rem',letterSpacing:'0.04em',color:'var(--ink,#1B1B1B)'}}),
      h('button',{type:'button','aria-label':'Choose time','aria-expanded':open,disabled,onClick:()=>setOpen(o=>!o),
        style:{position:'absolute',right:1,top:1,bottom:1,width:46,background:'var(--court-050,#EEF3F7)',border:'none',borderLeft:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.625rem',color:'var(--ink,#1B1B1B)'}},open?'\u25B4':'\u25BE')),
    open&&h('div',{role:'listbox','aria-label':'Times',style:{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,zIndex:30,background:'var(--white,#fff)',border:'1px solid var(--ink,#1B1B1B)',maxHeight:216,overflowY:'auto'}},
      slots.map(t=>h('button',{key:t,type:'button',role:'option','aria-selected':t===cur,
        onClick:()=>{commit(t);setOpen(false);inp.current&&inp.current.focus();},
        style:{display:'block',width:'100%',textAlign:'left',padding:'11px 14px',background:t===cur?'var(--ink,#1B1B1B)':'transparent',color:t===cur?'var(--line-white,#F7F7F7)':'var(--ink,#1B1B1B)',border:'none',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.8125rem',borderRadius:0},
        onMouseEnter:(e)=>{if(t!==cur)e.currentTarget.style.background='var(--court-050,#EEF3F7)';},
        onMouseLeave:(e)=>{if(t!==cur)e.currentTarget.style.background='transparent';}},t))),
    help&&h('span',{id:ids.current+'-help',style:HELP},help),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

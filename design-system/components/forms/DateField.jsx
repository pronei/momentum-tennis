import React,{useState,useRef,useEffect} from 'react';
const h=React.createElement;
const LBL={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
const HELP={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'};
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};
const INPUT={width:'100%',boxSizing:'border-box',height:48,padding:'0 58px 0 14px',background:'var(--white,#fff)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',borderRadius:0,fontFamily:'var(--font-mono)',fontSize:'0.9375rem',letterSpacing:'0.04em',color:'var(--ink,#1B1B1B)'};
const MONTHS=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const iso=(y,m,d)=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');

/* Date input with mono ISO value (2026-09-12) + a popover month grid (the portal calendar pattern).
   Typing a full ISO date is the primary keyboard path; the grid is arrow-key navigable. */
export function DateField({label,help,error,value,defaultValue,onChange,disabled=false,name,style}){
  const [own,setOwn]=useState(defaultValue||'');
  const cur=value!==undefined?value:own;
  const [open,setOpen]=useState(false);
  const seed=/^\d{4}-\d{2}-\d{2}$/.test(cur)?new Date(cur+'T12:00:00'):new Date();
  const [view,setView]=useState({y:seed.getFullYear(),m:seed.getMonth()});
  const wrap=useRef(null),grid=useRef(null),inp=useRef(null);
  const ids=useRef(null);if(!ids.current)ids.current='mtd'+Math.random().toString(36).slice(2,7);
  useEffect(()=>{
    if(!open)return;
    const away=(e)=>{if(wrap.current&&!wrap.current.contains(e.target))setOpen(false);};
    const esc=(e)=>{if(e.key==='Escape'){setOpen(false);inp.current&&inp.current.focus();}};
    document.addEventListener('mousedown',away);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',away);document.removeEventListener('keydown',esc);};
  },[open]);
  const commit=(v)=>{if(value===undefined)setOwn(v);onChange&&onChange(v);};
  const first=new Date(view.y,view.m,1).getDay();
  const days=new Date(view.y,view.m+1,0).getDate();
  const cells=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  const navBtn=(dir,lab)=>h('button',{type:'button','aria-label':lab,onClick:()=>setView(v=>{const m=v.m+dir;return{y:v.y+Math.floor(m/12),m:(m%12+12)%12};}),
    style:{width:40,height:36,background:'none',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--ink,#1B1B1B)',borderRadius:0}},dir<0?'\u2190':'\u2192');
  const onGridKey=(e)=>{
    const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
    if(d===undefined)return;e.preventDefault();
    const btns=[...grid.current.querySelectorAll('button[data-d]')];
    const i=btns.indexOf(document.activeElement);
    (btns[i+d]||btns[i])&&(btns[i+d]||btns[i]).focus();
  };
  return h('div',{ref:wrap,style:{display:'flex',flexDirection:'column',gap:8,position:'relative',...style}},
    label&&h('label',{htmlFor:ids.current,style:LBL},label),
    h('span',{style:{position:'relative',display:'block'}},
      h('input',{id:ids.current,ref:inp,type:'text',name,placeholder:'YYYY-MM-DD',maxLength:10,disabled,autoComplete:'off',
        value:cur,onChange:(e)=>commit(e.target.value),
        'aria-invalid':error?true:undefined,'aria-describedby':(help||error)?[help?ids.current+'-help':null,error?ids.current+'-err':null].filter(Boolean).join(' '):undefined,
        style:{...INPUT,...(error?{borderColor:'var(--state-error,#A8432D)'}:null)}}),
      h('button',{type:'button','aria-label':'Choose date','aria-expanded':open,disabled,onClick:()=>setOpen(o=>!o),
        style:{position:'absolute',right:1,top:1,bottom:1,width:46,background:'var(--court-050,#EEF3F7)',border:'none',borderLeft:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.625rem',color:'var(--ink,#1B1B1B)'}},open?'\u25B4':'\u25BE')),
    open&&h('div',{style:{position:'absolute',top:'calc(100% + 4px)',left:0,zIndex:30,background:'var(--white,#fff)',border:'1px solid var(--ink,#1B1B1B)',padding:12,width:308,boxSizing:'border-box'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}},
        navBtn(-1,'Previous month'),
        h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.75rem',letterSpacing:'0.07em',color:'var(--ink,#1B1B1B)'}},MONTHS[view.m]+' '+view.y),
        navBtn(1,'Next month')),
      h('div',{ref:grid,role:'grid',onKeyDown:onGridKey,style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}},
        ['SU','MO','TU','WE','TH','FR','SA'].map(d=>h('span',{key:d,style:{fontFamily:'var(--font-mono)',fontSize:'0.625rem',color:'var(--text-secondary,#46525E)',textAlign:'center',padding:'4px 0'}},d)),
        cells.map((d,i)=>{
          if(!d)return h('span',{key:'e'+i});
          const v=iso(view.y,view.m,d);const sel=v===cur;
          return h('button',{key:d,type:'button','data-d':d,'aria-label':v,'aria-pressed':sel,
            onClick:()=>{commit(v);setOpen(false);inp.current&&inp.current.focus();},
            style:{height:38,background:sel?'var(--ink,#1B1B1B)':'transparent',color:sel?'var(--line-white,#F7F7F7)':'var(--ink,#1B1B1B)',
              border:'1px solid '+(sel?'var(--ink,#1B1B1B)':'transparent'),cursor:'pointer',borderRadius:0,
              fontFamily:'var(--font-mono)',fontSize:'0.75rem'},
            onMouseEnter:(e)=>{if(!sel)e.currentTarget.style.background='var(--court-050,#EEF3F7)';},
            onMouseLeave:(e)=>{if(!sel)e.currentTarget.style.background='transparent';}},d);}))),
    help&&h('span',{id:ids.current+'-help',style:HELP},help),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

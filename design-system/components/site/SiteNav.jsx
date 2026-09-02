import React,{useState,useRef,useEffect} from 'react';
import {Wordmark} from '../brand/Wordmark.jsx';
import {Button} from '../core/Button.jsx';

const DEFAULT_LINKS={home:'#top',juniors:'#programs',camps:'#camp-day',adults:'#programs',jtt:'#jtt',calendar:'#calendar',store:'#store',login:'#login',book:'#book'};
const reduced=()=>typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function ensureNavStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-nav-styles'))return;
  const s=document.createElement('style');s.id='mt-nav-styles';
  s.textContent='@keyframes mt-sheet-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(s);
}
function useIsMobile(bp){
  const [m,setM]=useState(()=>typeof window!=='undefined'&&window.matchMedia(`(max-width:${bp}px)`).matches);
  useEffect(()=>{const q=window.matchMedia(`(max-width:${bp}px)`);const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[bp]);
  return m;
}
const labelStyle={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase'};

/* The site header: concise and hierarchical. Desktop: Programs dropdown + Calendar/Store tabs.
   Mobile (≤breakpoint): logo + Book pill + tri-color hamburger (past-cool → now-warm bars)
   opening a full-screen court-navy sheet. */
export function SiteNav({active='home',loggedIn=false,links={},breakpoint=760,campNote='JUN – JUL',style}){
  ensureNavStyles();
  const L={...DEFAULT_LINKS,...links};
  const isMobile=useIsMobile(breakpoint);
  const [open,setOpen]=useState(false);
  const [sheet,setSheet]=useState(false);
  const ddRef=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const close=(e)=>{if(ddRef.current&&!ddRef.current.contains(e.target))setOpen(false);};
    const esc=(e)=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('mousedown',close);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',esc);};
  },[open]);
  useEffect(()=>{
    if(!sheet)return;
    const prev=document.body.style.overflow;document.body.style.overflow='hidden';
    const esc=(e)=>{if(e.key==='Escape')setSheet(false);};
    document.addEventListener('keydown',esc);
    return()=>{document.body.style.overflow=prev;document.removeEventListener('keydown',esc);};
  },[sheet]);

  if(isMobile){
    const barBase={height:2,borderRadius:1,transition:'transform 0.22s ease, background 0.22s ease, opacity 0.22s ease'};
    const sheetLink=(href,children)=>React.createElement('a',{href,onClick:()=>setSheet(false),style:{display:'block',padding:'12px 0',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1.75rem',lineHeight:1.05,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--line-white,#F7F7F7)',textDecoration:'none'}},children);
    const smallLink=(href,children)=>React.createElement('a',{href,onClick:()=>setSheet(false),style:{...labelStyle,display:'block',padding:'12px 0',color:'var(--line-white,#F7F7F7)',textDecoration:'none'}},children);
    const grp=(t)=>React.createElement('div',{style:{fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--court-300,#7FA3C4)',margin:'16px 0 2px'}},t);
    const divider=React.createElement('div',{style:{height:1,background:'rgba(247,247,247,0.22)',margin:'12px 0'}});
    return React.createElement('header',{style:{position:'sticky',top:0,zIndex:20,background:'rgba(247,247,247,0.94)',backdropFilter:'blur(6px)',borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',...style}},
      React.createElement('div',{style:{padding:'0 8px 0 16px',display:'flex',alignItems:'center',justifyContent:'space-between',height:64}},
        React.createElement('a',{href:L.home,'aria-label':'Momentum Tennis home',style:{textDecoration:'none',display:'flex',alignItems:'center',gap:10}},
          React.createElement('img',{src:L.logoSrc||'../../assets/logo-mark.svg',alt:'',style:{height:36,display:'block'}}),
          React.createElement(Wordmark,{variant:'word',height:16})
        ),
        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:4}},
          React.createElement(Button,{variant:'secondary',size:'sm',href:L.book},'Book a trial'),
          React.createElement('button',{onClick:()=>setSheet(s=>!s),'aria-label':sheet?'Close menu':'Open menu','aria-expanded':sheet,style:{width:44,height:44,display:'grid',placeItems:'center',background:'none',border:'none',cursor:'pointer',position:'relative',zIndex:60,padding:0}},
            React.createElement('span',{style:{display:'flex',flexDirection:'column',gap:5,width:22}},
              React.createElement('span',{style:{...barBase,background:sheet?'var(--line-white,#F7F7F7)':'var(--court-300,#7FA3C4)',transform:sheet?'translateY(7px) rotate(45deg)':'none'}}),
              React.createElement('span',{style:{...barBase,background:'var(--court-500,#2B5680)',opacity:sheet?0:1}}),
              React.createElement('span',{style:{...barBase,background:sheet?'var(--line-white,#F7F7F7)':'var(--now,#E8A33D)',transform:sheet?'translateY(-7px) rotate(-45deg)':'none'}})
            ))
        )
      ),
      sheet&&React.createElement('div',{role:'dialog','aria-modal':true,'aria-label':'Site menu',style:{position:'fixed',inset:0,zIndex:50,background:'var(--court-800,#1C3655)',padding:'88px 24px 28px',overflowY:'auto',display:'flex',flexDirection:'column',animation:reduced()?'none':'mt-sheet-in 0.24s ease-out'}},
        grp('Programs'),
        sheetLink(L.juniors,'Classes'),
        sheetLink(L.jtt,'Team tennis'),
        sheetLink(L.adults,'Private lessons'),
        smallLink(L.camps,'Summer camps — '+campNote),
        divider,
        sheetLink(L.calendar,'Calendar'),
        sheetLink(L.store,'Store'),
        divider,
        smallLink(L.login,loggedIn?'Account':'Log in'),
        React.createElement('div',{style:{marginTop:'auto',paddingTop:24}},
          React.createElement(Button,{href:L.book},'Book a free trial class'))
      )
    );
  }

  const tab=(key,href,children)=>React.createElement('a',{href,style:{...labelStyle,color:'var(--ink,#1B1B1B)',textDecoration:'none',padding:'25px 2px 23px',
    borderBottom:active===key?'2px solid var(--ink,#1B1B1B)':'2px solid transparent'}},children);
  const item=(href,children)=>React.createElement('a',{href,role:'menuitem',onClick:()=>setOpen(false),style:{
    display:'block',padding:'11px 16px',...labelStyle,color:'var(--ink,#1B1B1B)',textDecoration:'none',whiteSpace:'nowrap'},
    onMouseEnter:(e)=>e.currentTarget.style.background='var(--court-050,#EEF3F7)',
    onMouseLeave:(e)=>e.currentTarget.style.background='transparent'},children);
  return React.createElement('header',{style:{position:'sticky',top:0,zIndex:20,background:'rgba(247,247,247,0.94)',backdropFilter:'blur(6px)',borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',...style}},
    React.createElement('div',{style:{maxWidth:'var(--container,1200px)',margin:'0 auto',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',height:72}},
      React.createElement('a',{href:L.home,'aria-label':'Momentum Tennis home',style:{textDecoration:'none',display:'flex',alignItems:'center',gap:12}},
        React.createElement('img',{src:L.logoSrc||'../../assets/logo-mark.svg',alt:'',style:{height:42,display:'block'}}),
        React.createElement(Wordmark,{variant:'word',height:19})
      ),
      React.createElement('nav',{'aria-label':'Primary',style:{display:'flex',gap:28,alignItems:'center',alignSelf:'stretch'}},
        React.createElement('span',{ref:ddRef,style:{position:'relative',display:'flex',alignSelf:'stretch',alignItems:'center'}},
          React.createElement('button',{onClick:()=>setOpen(o=>!o),'aria-haspopup':'true','aria-expanded':open,style:{
            background:'none',border:'none',cursor:'pointer',padding:'25px 2px 23px',alignSelf:'stretch',...labelStyle,color:'var(--ink,#1B1B1B)',
            borderBottom:active==='programs'?'2px solid var(--ink,#1B1B1B)':'2px solid transparent'}},
            'Programs ',React.createElement('span',{'aria-hidden':true,style:{fontFamily:'var(--font-mono)',fontSize:'0.625rem',verticalAlign:'2px'}},open?'\u25B4':'\u25BE')),
          open&&React.createElement('div',{role:'menu',style:{position:'absolute',top:'100%',left:-16,minWidth:230,background:'var(--white,#fff)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',padding:'6px 0'}},
            item(L.juniors,'Classes'),
            item(L.jtt,'Team tennis'),
            item(L.adults,'Private lessons'),
            React.createElement('div',{style:{borderTop:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',margin:'6px 0'}}),
            item(L.camps,['Summer camps  ',React.createElement('span',{key:'n',style:{fontFamily:'var(--font-mono)',fontSize:'0.625rem',letterSpacing:'0.05em',color:'var(--court-400,#3E6C99)'}},campNote)]))
        ),
        tab('calendar',L.calendar,'Calendar'),
        tab('store',L.store,'Store')
      ),
      React.createElement('div',{style:{display:'flex',gap:16,alignItems:'center'}},
        React.createElement('a',{href:L.login,style:{...labelStyle,color:active==='account'?'var(--ink,#1B1B1B)':'var(--ink-secondary,#46525E)',textDecoration:active==='account'?'underline':'none',textUnderlineOffset:6}},loggedIn?'Account':'Log in'),
        React.createElement(Button,{variant:'secondary',size:'sm',href:L.book},'Book a trial')
      )
    )
  );
}

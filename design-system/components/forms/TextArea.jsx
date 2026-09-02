import React,{useRef} from 'react';
const h=React.createElement;
const LBL={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
const HELP={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'};
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};
function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-ta-styles'))return;
  const s=document.createElement('style');s.id='mt-ta-styles';
  s.textContent=`
.mt-ta{width:100%;box-sizing:border-box;min-height:96px;padding:12px 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;line-height:1.55;color:var(--ink,#1B1B1B);resize:vertical;transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-ta::placeholder{color:var(--court-300,#7FA3C4)}
.mt-ta:hover{border-color:var(--court-300,#7FA3C4)}
.mt-ta:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-ta[disabled]{opacity:.45}`;
  document.head.appendChild(s);
}

/* Multi-line input with the shared form anatomy. Native caret (the ball caret is inputs-only). */
export function TextArea({label,help,error,placeholder,rows=4,value,defaultValue,onChange,disabled=false,name,style,inputStyle}){
  ensureStyles();
  const ids=useRef(null);if(!ids.current)ids.current='mta'+Math.random().toString(36).slice(2,7);
  return h('label',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    label&&h('span',{style:LBL},label),
    h('textarea',{className:'mt-ta',rows,name,placeholder,value,defaultValue,onChange,disabled,
      'aria-invalid':error?true:undefined,
      'aria-describedby':(help||error)?[help?ids.current+'-help':null,error?ids.current+'-err':null].filter(Boolean).join(' '):undefined,
      style:error?{borderColor:'var(--state-error,#A8432D)',...inputStyle}:inputStyle}),
    help&&h('span',{id:ids.current+'-help',style:HELP},help),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

import React,{useRef,useState,useEffect} from 'react';

function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-field-styles'))return;
  const s=document.createElement('style');s.id='mt-field-styles';
  s.textContent=`
.mt-field-input{width:100%;box-sizing:border-box;height:48px;padding:0 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;color:var(--ink,#1B1B1B);transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-field-input::placeholder{color:var(--court-300,#7FA3C4)}
.mt-field-input:hover{border-color:var(--court-300,#7FA3C4)}
.mt-field-input:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-field-input.mt-ball{caret-color:transparent}
@keyframes mt-ball-bounce{0%{width:2px;height:18px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,0);animation-timing-function:cubic-bezier(0.2,0,0.4,1)}30%{width:2px;height:16px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,-12px);animation-timing-function:linear}44%{width:7px;height:7px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,-14px);animation-timing-function:cubic-bezier(0.55,0,1,0.7)}70%{width:7px;height:7px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,0);animation-timing-function:ease-out}76%{width:9px;height:6px;border-radius:50%;background:var(--now,#E8A33D);transform:translate(-50%,1px);animation-timing-function:cubic-bezier(0.2,0,0.3,1)}90%,100%{width:2px;height:18px;border-radius:1px;background:var(--ink,#1B1B1B);transform:translate(-50%,0)}}`;
  document.head.appendChild(s);
}
const reduced=()=>typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Text input whose caret is a tennis ball bouncing on the baseline — the blink, replayed as motion. */
export function TextField({label,help,error,placeholder,type='text',defaultValue,value,onChange,name,ballCaret=true,disabled=false,style,inputStyle}){
  ensureStyles();
  const ref=useRef(null);
  const ids=useRef(null);
  if(!ids.current)ids.current='mtf'+Math.random().toString(36).slice(2,7);
  const [caret,setCaret]=useState({x:14,on:false});
  const useBall=ballCaret&&!reduced();
  const measure=()=>{
    const el=ref.current;if(!el)return;
    const cs=getComputedStyle(el);
    if(!measure.c)measure.c=document.createElement('canvas');
    const ctx=measure.c.getContext('2d');
    ctx.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const pos=el.selectionDirection==='backward'?el.selectionStart:(el.selectionEnd??el.value.length);
    const w=ctx.measureText(el.value.slice(0,pos)).width;
    const x=parseFloat(cs.paddingLeft)+w-el.scrollLeft;
    setCaret(c=>({...c,x:Math.max(6,Math.min(x,el.clientWidth-8))}));
  };
  useEffect(()=>{if(caret.on)measure();},[value]);
  return React.createElement('label',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    label&&React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'}},label),
    React.createElement('span',{style:{position:'relative',display:'block'}},
      React.createElement('input',{ref,type,name,placeholder,defaultValue,value,onChange,disabled,
        'aria-invalid':error?true:undefined,
        'aria-describedby':(help||error)?[help?ids.current+'-help':null,error?ids.current+'-err':null].filter(Boolean).join(' '):undefined,
        className:'mt-field-input'+(useBall?' mt-ball':''),style:error?{borderColor:'var(--state-error,#A8432D)',...inputStyle}:inputStyle,
        onFocus:()=>{setCaret(c=>({...c,on:true}));requestAnimationFrame(measure);},
        onBlur:()=>setCaret(c=>({...c,on:false})),
        onInput:measure,onSelect:measure,onKeyUp:measure,onClick:measure}),
      useBall&&caret.on&&!disabled&&React.createElement('span',{'aria-hidden':true,style:{
        position:'absolute',left:caret.x,bottom:14,width:2,height:18,borderRadius:1,
        background:'var(--ink,#1B1B1B)',pointerEvents:'none',
        animation:'mt-ball-bounce 1.3s infinite'}})
    ),
    help&&React.createElement('span',{id:ids.current+'-help',style:{fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'}},help),
    error&&React.createElement('span',{id:ids.current+'-err',role:'alert',style:{fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'}},'ERROR: ',error)
  );
}

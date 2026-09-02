import React,{useState,useRef} from 'react';
const h=React.createElement;
const LBL={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
const HELP={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'};
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};
function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-select-styles'))return;
  const s=document.createElement('style');s.id='mt-select-styles';
  s.textContent=`
.mt-select{appearance:none;-webkit-appearance:none;width:100%;box-sizing:border-box;height:48px;padding:0 40px 0 14px;background:var(--white,#fff);border:1px solid var(--border-hairline,rgba(27,27,27,0.16));border-radius:0;font-family:var(--font-sans);font-size:1rem;color:var(--ink,#1B1B1B);cursor:pointer;transition:border-color var(--dur-fast,120ms) var(--ease-out,ease)}
.mt-select:hover{border-color:var(--court-300,#7FA3C4)}
.mt-select:focus{outline:none;border-color:var(--court-500,#2B5680)}
.mt-select[disabled]{opacity:.45;cursor:default}`;
  document.head.appendChild(s);
}

/* Styled native select. Square, hairline, mono ▾ affordance matching the nav dropdown. */
export function Select({label,help,error,options=[],value,defaultValue,onChange,placeholder,name,disabled=false,style,selectStyle}){
  ensureStyles();
  const ids=useRef(null);if(!ids.current)ids.current='mts'+Math.random().toString(36).slice(2,7);
  const db=(help||error)?[help?ids.current+'-help':null,error?ids.current+'-err':null].filter(Boolean).join(' '):undefined;
  return h('label',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    label&&h('span',{style:LBL},label),
    h('span',{style:{position:'relative',display:'block'}},
      h('select',{className:'mt-select',name,value,defaultValue:value===undefined?(defaultValue??(placeholder?'':undefined)):undefined,onChange,disabled,'aria-invalid':error?true:undefined,'aria-describedby':db,
        style:error?{borderColor:'var(--state-error,#A8432D)',...selectStyle}:selectStyle},
        placeholder&&h('option',{value:'',disabled:true},placeholder),
        options.map((o,i)=>{const v=typeof o==='object'?o:{value:o,label:o};return h('option',{key:i,value:v.value},v.label);})),
      h('span',{'aria-hidden':true,style:{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',fontFamily:'var(--font-mono)',fontSize:'0.625rem',color:disabled?'var(--text-secondary,#46525E)':'var(--ink,#1B1B1B)',pointerEvents:'none'}},'\u25BE')),
    help&&h('span',{id:ids.current+'-help',style:HELP},help),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

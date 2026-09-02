import React,{useState,useRef} from 'react';
const h=React.createElement;
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};
function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-check-styles'))return;
  const s=document.createElement('style');s.id='mt-check-styles';
  s.textContent=`
.mt-check-input{position:absolute;opacity:0;margin:0;width:100%;height:100%;cursor:pointer}
.mt-check-input:focus-visible+.mt-check-frame{outline:2px solid var(--focus-on-light,#2B5680);outline-offset:2px}
.mt-check-input[disabled]{cursor:default}`;
  document.head.appendChild(s);
}

/* A frame that fills: hairline square, solid ink when checked — the attendance-strip squares are the precedent.
   consent variant: larger frame + body-copy label, for waiver signing. */
export function Checkbox({label,checked,defaultChecked,onChange,disabled=false,consent=false,error,name,style}){
  ensureStyles();
  const [own,setOwn]=useState(!!defaultChecked);
  const isOn=checked!==undefined?checked:own;
  const ids=useRef(null);if(!ids.current)ids.current='mtc'+Math.random().toString(36).slice(2,7);
  const size=consent?28:20;
  return h('div',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    h('label',{style:{display:'flex',gap:consent?14:12,alignItems:'flex-start',minHeight:44,cursor:disabled?'default':'pointer',opacity:disabled?0.45:1,padding:'2px 0'}},
      h('span',{style:{position:'relative',flex:'none',width:size,height:size,marginTop:consent?2:1}},
        h('input',{type:'checkbox',className:'mt-check-input',name,checked:checked!==undefined?checked:undefined,defaultChecked:checked===undefined?defaultChecked:undefined,disabled,
          'aria-invalid':error?true:undefined,'aria-describedby':error?ids.current+'-err':undefined,
          onChange:(e)=>{if(checked===undefined)setOwn(e.target.checked);onChange&&onChange(e);}}),
        h('span',{className:'mt-check-frame','aria-hidden':true,style:{position:'absolute',inset:0,boxSizing:'border-box',
          border:'1px solid '+(error?'var(--state-error,#A8432D)':isOn?'var(--ink,#1B1B1B)':'rgba(27,27,27,0.4)'),
          background:isOn?'var(--ink,#1B1B1B)':'var(--white,#fff)',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)'}})),
      label&&h('span',{style:consent?{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.55,color:'var(--ink,#1B1B1B)'}:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.5,color:'var(--ink,#1B1B1B)',alignSelf:'center'}},label)),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

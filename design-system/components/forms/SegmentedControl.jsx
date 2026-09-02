import React,{useState,useRef} from 'react';
const h=React.createElement;
const LBL={fontFamily:'var(--font-sans)',fontSize:'var(--size-label,.8125rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
const HELP={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--text-secondary,#46525E)'};
const ERR={fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,letterSpacing:'0.04em',color:'var(--state-error,#A8432D)',textTransform:'uppercase'};

/* Mutually exclusive choice as a frame row — the ClassTimeline weekend/weekday toggle, generalized.
   Replaces circular radios entirely (circles violate the shape law) and iOS switches (on/off rows are
   two-option SegmentedControls: ON / OFF, VISIBLE TO FAMILY / INTERNAL). */
export function SegmentedControl({label,help,error,options=[],value,defaultValue,onChange,disabled=false,fullWidth=false,compact=false,name,style}){
  const opts=options.map(o=>typeof o==='object'?o:{value:o,label:o});
  const [own,setOwn]=useState(defaultValue!==undefined?defaultValue:undefined);
  const cur=value!==undefined?value:own;
  const ids=useRef(null);if(!ids.current)ids.current='mtsg'+Math.random().toString(36).slice(2,7);
  const set=(v)=>{if(disabled)return;if(value===undefined)setOwn(v);onChange&&onChange(v);};
  const onKey=(e)=>{
    const i=opts.findIndex(o=>o.value===cur);
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();set(opts[(i+1)%opts.length].value);}
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();set(opts[(i-1+opts.length)%opts.length].value);}
  };
  return h('div',{style:{display:'flex',flexDirection:'column',gap:8,...style}},
    label&&h('span',{style:LBL,id:ids.current+'-lbl'},label),
    h('div',{role:'radiogroup','aria-labelledby':label?ids.current+'-lbl':undefined,'aria-describedby':error?ids.current+'-err':undefined,onKeyDown:onKey,style:{display:'flex',gap:8,flexWrap:'wrap',opacity:disabled?0.45:1}},
      opts.map((o)=>{const on=o.value===cur;
        return h('button',{key:o.value,type:'button',role:'radio','aria-checked':on,tabIndex:on||cur===undefined&&o===opts[0]?0:-1,disabled,name,
          onClick:()=>set(o.value),
          style:{height:compact?40:48,padding:'0 16px',flex:fullWidth?1:'none',
            border:on?'1px solid var(--ink,#1B1B1B)':'1px solid '+(error?'var(--state-error,#A8432D)':'var(--border-hairline,rgba(27,27,27,0.16))'),
            background:on?'var(--court-050,#EEF3F7)':'transparent',cursor:disabled?'default':'pointer',borderRadius:0,
            fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.08em',fontWeight:on?600:400,
            color:'var(--ink,#1B1B1B)',textTransform:'uppercase',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)'}},o.label);})),
    help&&h('span',{style:HELP},help),
    error&&h('span',{id:ids.current+'-err',role:'alert',style:ERR},'ERROR: ',error));
}

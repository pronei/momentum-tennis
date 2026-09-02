import React,{useState,useEffect,useRef} from 'react';
import {SegmentedControl} from '../forms/SegmentedControl.jsx';
import {Select} from '../forms/Select.jsx';
const h=React.createElement;
function useMobile(){
  const [m,setM]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches);
  useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}
const TYPE_BG={camp:'var(--court-050,#EEF3F7)','class':'var(--court-100,#DCE6EE)',team:'var(--court-200,#A9BDC9)','private':'var(--court-300,#7FA3C4)'};
const toMin=(s)=>{const m=/^(\d{1,2}):(\d{2})$/.exec(s||'');return m?(+m[1])*60+(+m[2]):null;};
const MONO=(s,c)=>({fontFamily:'var(--font-mono)',fontSize:s,letterSpacing:'0.05em',color:c||'var(--text-secondary,#46525E)',textTransform:'uppercase'});

/* The admin day grid: one column per court, hour rows, session blocks colored by type from the
   cool ramp with ink text. Amber is reserved for the current-time line and NOTHING else.
   States: cancelled (dimmed + struck mono label), draft ghost frame (drag-to-create stand-in:
   click an empty slot), and the conflict rejection — a blocked drop with a mono ERROR line.
   The database enforces conflicts; this shows the refusal well. ≤760px: single court + switcher. */
export function ResourceDayView({date='2026-09-12',location,locations=['DE ANZA','MURDOCK'],onLocationChange,courts=[],sessions=[],draft,nowTime,onSessionClick,onSlotClick,startHour=7,endHour=21,rowH=44,style}){
  const m=useMobile();
  const [ownLoc,setOwnLoc]=useState(location||locations[0]);
  const loc=location!==undefined?location:ownLoc;
  const visCourts=courts.filter(c=>!c.location||c.location===loc);
  const [mobCourt,setMobCourt]=useState(null);
  const shown=m?visCourts.filter(c=>c.id===(mobCourt||visCourts[0]&&visCourts[0].id)):visCourts;
  const H=(endHour-startHour)*rowH;
  const y=(t)=>{const mi=toMin(t);return mi===null?0:(mi-startHour*60)/60*rowH;};
  const colRef=useRef(null);
  const block=(s)=>{
    const top=y(s.start),hgt=Math.max(20,y(s.end)-y(s.start)-2);
    return h('button',{key:s.id,type:'button',onClick:onSessionClick?()=>onSessionClick(s):undefined,
      'aria-label':(s.cancelled?'Cancelled: ':'')+s.title+' '+s.start+'–'+s.end,
      style:{position:'absolute',left:3,right:3,top,height:hgt,textAlign:'left',overflow:'hidden',boxSizing:'border-box',
        background:s.cancelled?'transparent':(TYPE_BG[s.type]||TYPE_BG['class']),
        border:'1px solid '+(s.cancelled?'var(--border-hairline,rgba(27,27,27,0.16))':'rgba(27,27,27,0.22)'),
        opacity:s.cancelled?0.6:1,cursor:onSessionClick?'pointer':'default',borderRadius:0,padding:'5px 8px',
        display:'flex',flexDirection:'column',gap:2}},
      h('span',{style:{...MONO('0.625rem',s.cancelled?'var(--text-secondary,#46525E)':'var(--ink,#1B1B1B)'),textDecoration:s.cancelled?'line-through':'none'}},s.start+'\u2013'+s.end+(s.cancelled?' \u00B7 CANCELLED':'')),
      h('span',{style:{fontFamily:'var(--font-sans)',fontSize:'0.78rem',fontWeight:600,color:s.cancelled?'var(--text-secondary,#46525E)':'var(--ink,#1B1B1B)',textDecoration:s.cancelled?'line-through':'none',lineHeight:1.2}},s.title),
      s.coach&&hgt>52&&h('span',{style:MONO('0.625rem')},s.coach));
  };
  const ghost=(d)=>{
    const top=y(d.start),hgt=Math.max(20,y(d.end)-y(d.start)-2);
    return h('div',{style:{position:'absolute',left:3,right:3,top,height:hgt,boxSizing:'border-box',
      border:'1px solid '+(d.conflict?'var(--state-error,#A8432D)':'var(--ink,#1B1B1B)'),background:'transparent',
      padding:'5px 8px',display:'flex',flexDirection:'column',gap:2,zIndex:2}},
      h('span',{style:MONO('0.625rem','var(--ink,#1B1B1B)')},'NEW \u00B7 '+d.start+'\u2013'+d.end),
      d.conflict&&h('span',{role:'alert',style:{...MONO('0.625rem','var(--state-error,#A8432D)'),lineHeight:1.4}},'ERROR: '+d.conflict));
  };
  const slotClick=(courtId)=>(e)=>{
    if(!onSlotClick||e.target!==e.currentTarget)return;
    const r=e.currentTarget.getBoundingClientRect();
    const mins=startHour*60+Math.floor(((e.clientY-r.top)/rowH)*60/30)*30;
    onSlotClick(courtId,String(Math.floor(mins/60)).padStart(2,'0')+':'+String(mins%60).padStart(2,'0'));
  };
  return h('div',{style},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:14}},
      h('span',{style:MONO('0.8125rem','var(--ink,#1B1B1B)')},date),
      h('div',{style:{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}},
        m&&visCourts.length>1&&h(Select,{options:visCourts.map(c=>({value:c.id,label:c.label})),value:mobCourt||visCourts[0].id,onChange:(e)=>setMobCourt(e.target.value),style:{width:170}}),
        h(SegmentedControl,{compact:true,options:locations,value:loc,onChange:(v)=>{setOwnLoc(v);setMobCourt(null);onLocationChange&&onLocationChange(v);}}))),
    h('div',{style:{display:'grid',gridTemplateColumns:'56px repeat('+shown.length+',1fr)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',background:'var(--white,#fff)'}},
      h('div',null),shown.map(c=>h('div',{key:c.id,style:{...MONO('0.6875rem','var(--ink,#1B1B1B)'),textAlign:'center',padding:'10px 4px',borderLeft:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))'}},c.label)),
      h('div',{style:{position:'relative',height:H}},
        Array.from({length:endHour-startHour},(_,i)=>h('div',{key:i,style:{position:'absolute',top:i*rowH,right:6,transform:'translateY(-6px)',...MONO('0.625rem')}},i>0?String(startHour+i).padStart(2,'0')+':00':''))),
      shown.map(c=>h('div',{key:c.id,ref:colRef,onClick:slotClick(c.id),style:{position:'relative',height:H,borderLeft:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',cursor:onSlotClick?'copy':'default',
        backgroundImage:'repeating-linear-gradient(to bottom, transparent 0, transparent '+(rowH-1)+'px, var(--border-hairline,rgba(27,27,27,0.16)) '+(rowH-1)+'px, var(--border-hairline,rgba(27,27,27,0.16)) '+rowH+'px)'}},
        sessions.filter(s=>s.court===c.id&&(!s.location||s.location===loc)).map(block),
        draft&&draft.court===c.id&&ghost(draft),
        nowTime&&toMin(nowTime)>=startHour*60&&toMin(nowTime)<=endHour*60&&h('div',{'aria-hidden':true,style:{position:'absolute',left:0,right:0,top:y(nowTime),height:2,background:'var(--now,#E8A33D)',zIndex:3}},
          c===shown[shown.length-1]&&h('span',{style:{position:'absolute',right:2,top:-14,...MONO('0.5625rem','var(--accent-present-hover,#C77F14)')}},'NOW '+nowTime))))),
    h('div',{style:{display:'flex',gap:18,flexWrap:'wrap',marginTop:10}},
      Object.entries({camp:'CAMP','class':'CLASS',team:'TEAM','private':'PRIVATE'}).map(([k,v])=>h('span',{key:k,style:{display:'inline-flex',alignItems:'center',gap:8,...MONO('0.625rem')}},
        h('span',{style:{width:8,height:8,background:TYPE_BG[k],border:'1px solid rgba(27,27,27,0.22)'}}),v)),
      h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,...MONO('0.625rem')}},h('span',{style:{width:8,height:2,background:'var(--now,#E8A33D)'}}),'NOW')));
}

import React from 'react';

/* Wordmark: MOMENTUM in Chivo Black; the full stop is the ball — two cool ghost frames settle into the warm present. */
export function Wordmark({variant='lockup',height=44,onField=false,style}){
  const ink=onField?'var(--line-white,#F7F7F7)':'var(--ink,#1B1B1B)';
  const sub=onField?'var(--text-on-field-dim,#A9BDC9)':'var(--ink-secondary,#46525E)';
  const trail=(em)=>React.createElement('span',{style:{position:'relative',display:'inline-block',width:'0.62em',height:'0.72em',flex:'none'},'aria-hidden':true},
    height>=30&&React.createElement('span',{style:{position:'absolute',left:0,bottom:'0.40em',width:'0.13em',height:'0.13em',borderRadius:'50%',background:'var(--ghost-2,#A9BDC9)'}}),
    height>=30&&React.createElement('span',{style:{position:'absolute',left:'0.19em',bottom:'0.16em',width:'0.13em',height:'0.13em',borderRadius:'50%',background:'var(--ghost-3,#7FA3C4)'}}),
    React.createElement('span',{style:{position:'absolute',left:'0.42em',bottom:0,width:'0.15em',height:'0.15em',borderRadius:'50%',background:'var(--now,#E8A33D)'}})
  );
  if(variant==='mark'){
    return React.createElement('span',{style:{position:'relative',display:'inline-block',width:height,height:height*0.72,...style},role:'img','aria-label':'Momentum Tennis'},
      React.createElement('span',{style:{position:'absolute',left:0,bottom:'56%',width:'22%',height:'30.5%',borderRadius:'50%',background:'var(--ghost-2,#A9BDC9)'}}),
      React.createElement('span',{style:{position:'absolute',left:'31%',bottom:'22%',width:'22%',height:'30.5%',borderRadius:'50%',background:'var(--ghost-3,#7FA3C4)'}}),
      React.createElement('span',{style:{position:'absolute',left:'66%',bottom:0,width:'24.5%',height:'34%',borderRadius:'50%',background:'var(--now,#E8A33D)'}})
    );
  }
  const word=React.createElement('span',{style:{display:'inline-flex',alignItems:'baseline',fontFamily:'var(--font-display)',fontWeight:900,fontSize:height,lineHeight:1,letterSpacing:'0.01em',color:ink,textTransform:'uppercase',whiteSpace:'nowrap'}},variant==='word'?'MOMENTUM\u00A0TENNIS':'MOMENTUM',trail());
  if(variant==='word')return React.createElement('span',{style:{display:'inline-block',...style}},word);
  return React.createElement('span',{style:{display:'inline-flex',flexDirection:'column',gap:Math.max(3,height*0.14),...style}},
    word,
    React.createElement('span',{style:{display:'flex',justifyContent:'space-between',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:Math.max(9,height*0.252),lineHeight:1,color:sub,textTransform:'uppercase'},'aria-hidden':true},'TENNIS'.split('').map((c,i)=>React.createElement('span',{key:i},c))),
    React.createElement('span',{style:{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0 0 0 0)'}},'Momentum Tennis')
  );
}

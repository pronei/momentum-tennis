import React from 'react';

const RATIOS={'3:2':'3 / 2','4:3':'4 / 3','1:1':'1 / 1','16:9':'16 / 9','3:4':'3 / 4','2:3':'2 / 3'};

/* Every photograph in the system passes through this frame. Candid archive → analytical object:
   contained (never full-bleed), square-cornered, hairline-framed, mono-annotated. */
export function PhotoFrame({src,alt='',ratio='3:2',focal='50% 38%',treatment='plain',slices=5,tag,caption,captionRight,frame=true,style}){
  const stage={position:'relative',aspectRatio:RATIOS[ratio]||ratio,overflow:'hidden',background:'var(--court-050,#EEF3F7)'};
  let media;
  if(treatment==='slice'){
    const n=Math.max(3,slices);
    media=React.createElement('div',{style:{...stage,display:'flex'},role:'img','aria-label':alt},
      Array.from({length:n},(_,i)=>{
        const back=n-1-i; // 0 = lead (rightmost, present), grows toward the past
        const wash=back/(n-1);
        return React.createElement('div',{key:i,style:{flex:1,position:'relative',overflow:'hidden',transform:`translateY(${(back*2.6).toFixed(1)}%)`,borderLeft:back===0?'2px solid var(--now,#E8A33D)':'none',boxSizing:'border-box'}},
          React.createElement('div',{style:{position:'absolute',top:0,left:`${-i*100}%`,width:`${n*100}%`,height:'100%',backgroundImage:`url("${src}")`,backgroundSize:'cover',backgroundPosition:focal,filter:back===0?'none':`grayscale(${Math.min(1,wash*1.15)}) brightness(${1-wash*0.12})`}}),
          back>0&&React.createElement('div',{style:{position:'absolute',inset:0,background:'var(--court-500,#2B5680)',opacity:0.14+wash*0.38,mixBlendMode:'color'}}),
          back>0&&React.createElement('div',{style:{position:'absolute',inset:0,background:'var(--court-700,#24466B)',opacity:wash*0.22,mixBlendMode:'multiply'}})
        );
      })
    );
  }else{
    media=React.createElement('div',{style:stage},
      React.createElement('img',{src,alt,loading:'lazy',style:{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:focal,display:'block',filter:treatment==='wash'?'grayscale(1) contrast(1.06) brightness(0.94)':'none'}}),
      treatment==='wash'&&React.createElement('div',{style:{position:'absolute',inset:0,background:'var(--court-500,#2B5680)',mixBlendMode:'color'}}),
      treatment==='wash'&&React.createElement('div',{style:{position:'absolute',inset:0,background:'linear-gradient(180deg,rgba(22,51,78,0.06),rgba(22,51,78,0.32))',mixBlendMode:'multiply'}})
    );
  }
  return React.createElement('figure',{style:{margin:0,border:frame?'1px solid var(--border-hairline,rgba(27,27,27,0.16))':'none',background:'var(--surface-card,#fff)',...style}},
    React.createElement('div',{style:{position:'relative'}},
      media,
      tag&&React.createElement('span',{style:{position:'absolute',top:10,left:10,fontFamily:'var(--font-mono)',fontSize:'0.6875rem',letterSpacing:'0.08em',textTransform:'uppercase',background:'var(--court-800,#1C3655)',color:'var(--line-white,#F7F7F7)',padding:'4px 9px',lineHeight:1.3}},tag)
    ),
    (caption||captionRight)&&React.createElement('figcaption',{style:{display:'flex',justifyContent:'space-between',gap:16,borderTop:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',padding:'9px 12px',fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.45,color:'var(--text-secondary,#46525E)'}},
      React.createElement('span',null,caption),
      captionRight&&React.createElement('span',{style:{whiteSpace:'nowrap'}},captionRight)
    )
  );
}

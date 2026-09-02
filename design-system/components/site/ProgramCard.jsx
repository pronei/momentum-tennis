import React from 'react';
import {Eyebrow} from '../core/Eyebrow.jsx';
import {Button} from '../core/Button.jsx';
import {PhotoFrame} from '../media/PhotoFrame.jsx';

/* Program card — repeats across junior / camps / adult pages. Location, level, schedule, CTA. */
export function ProgramCard({eyebrow,title,level,location,schedule=[],note,photo,photoRatio='3:2',photoFocal,photoTreatment='wash',photoAlt='',ctaLabel='View schedule',ctaHref='#',primaryCta=false,style}){
  return React.createElement('article',{style:{background:'var(--surface-card,#fff)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',display:'flex',flexDirection:'column',...style}},
    photo&&React.createElement(PhotoFrame,{src:photo,alt:photoAlt,ratio:photoRatio,focal:photoFocal,treatment:photoTreatment,frame:false,style:{borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))'}}),
    React.createElement('div',{style:{padding:'24px 24px 28px',display:'flex',flexDirection:'column',gap:16,flex:1}},
      React.createElement(Eyebrow,{ticks:true},eyebrow),
      React.createElement('h3',{style:{margin:0,fontFamily:'var(--font-display)',fontWeight:900,fontSize:'var(--size-h3,1.75rem)',lineHeight:1.05,letterSpacing:'0.01em',textTransform:'uppercase',color:'var(--ink,#1B1B1B)'}},title),
      (level||location)&&React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px 20px',fontFamily:'var(--font-mono)',fontSize:'0.75rem',lineHeight:1.5,color:'var(--text-secondary,#46525E)',textTransform:'uppercase',letterSpacing:'0.04em'}},
        level&&React.createElement('span',null,'LEVEL — ',level),
        location&&React.createElement('span',null,'AT — ',location)
      ),
      schedule.length>0&&React.createElement('div',{style:{borderTop:'1px solid var(--border-hairline,rgba(27,27,27,0.16))'}},
        schedule.map((row,i)=>React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:16,padding:'10px 0',borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))'}},
          React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',fontWeight:600,color:'var(--ink,#1B1B1B)'}},row.days),
          React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.8125rem',color:'var(--court-500,#2B5680)',whiteSpace:'nowrap'}},row.time),
          row.detail&&React.createElement('span',{style:{fontFamily:'var(--font-sans)',fontSize:'0.8125rem',color:'var(--text-secondary,#46525E)',marginLeft:'auto'}},row.detail)
        ))
      ),
      note&&React.createElement('p',{style:{margin:0,fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',lineHeight:1.55,color:'var(--text-secondary,#46525E)'}},note),
      React.createElement('div',{style:{marginTop:'auto',paddingTop:8}},
        React.createElement(Button,{variant:primaryCta?'primary':'secondary',size:'sm',href:ctaHref},ctaLabel)
      )
    )
  );
}

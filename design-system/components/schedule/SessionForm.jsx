import React,{useState} from 'react';
import {SegmentedControl} from '../forms/SegmentedControl.jsx';
import {Select} from '../forms/Select.jsx';
import {DateField} from '../forms/DateField.jsx';
import {TimeField} from '../forms/TimeField.jsx';
import {TextArea} from '../forms/TextArea.jsx';
import {Banner} from '../feedback/Banner.jsx';
import {Button} from '../core/Button.jsx';
const h=React.createElement;

/* Create/edit a session with the Group-1 controls. The conflict prop renders the inline
   rejection state — the database refuses double-booking; this form shows the refusal. */
export function SessionForm({value={},courts=[],coaches=[],conflict,onSubmit,onCancel,submitLabel='Save session',style}){
  const [v,setV]=useState({type:'class',court:courts[0]&&courts[0].id,coach:coaches[0],date:'2026-09-12',start:'16:00',end:'17:30',notes:'',...value});
  const set=(k)=>(val)=>setV(s=>({...s,[k]:val&&val.target?val.target.value:val}));
  return h('form',{onSubmit:(e)=>{e.preventDefault();onSubmit&&onSubmit(v);},style:{display:'flex',flexDirection:'column',gap:16,...style}},
    h(SegmentedControl,{label:'Type',fullWidth:true,options:[{value:'class',label:'Class'},{value:'camp',label:'Camp'},{value:'team',label:'Team'},{value:'private',label:'Private'}],value:v.type,onChange:set('type')}),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}},
      h(Select,{label:'Court',options:courts.map(c=>({value:c.id,label:c.label})),value:v.court,onChange:set('court')}),
      h(Select,{label:'Coach',options:coaches,value:v.coach,onChange:set('coach')})),
    h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:16}},
      h(DateField,{label:'Date',value:v.date,onChange:set('date')}),
      h(TimeField,{label:'Start',value:v.start,onChange:set('start')}),
      h(TimeField,{label:'End',value:v.end,onChange:set('end'),error:conflict?undefined:(v.end<=v.start?'end must be after start':undefined)})),
    h(TextArea,{label:'Notes',rows:2,value:v.notes,onChange:set('notes'),placeholder:'Optional'}),
    conflict&&h(Banner,{tone:'error'},conflict),
    h('div',{style:{display:'flex',gap:12,justifyContent:'flex-end',flexWrap:'wrap'}},
      onCancel&&h(Button,{variant:'ghost',onClick:onCancel},'Cancel'),
      h(Button,{type:'submit',disabled:!!conflict},submitLabel)));
}

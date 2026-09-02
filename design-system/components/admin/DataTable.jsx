import React,{useState,useEffect} from 'react';
import {Pagination} from '../feedback/Pagination.jsx';
import {EmptyState} from '../feedback/EmptyState.jsx';
const h=React.createElement;
function useMobile(){
  const [m,setM]=useState(()=>typeof window!=='undefined'&&window.matchMedia('(max-width:760px)').matches);
  useEffect(()=>{const q=window.matchMedia('(max-width:760px)');const f=e=>setM(e.matches);q.addEventListener('change',f);return()=>q.removeEventListener('change',f);},[]);
  return m;
}
function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-dt-styles'))return;
  const s=document.createElement('style');s.id='mt-dt-styles';
  s.textContent='.mt-dt-row:hover{background:var(--court-050,#EEF3F7)}.mt-dt-row--click{cursor:pointer}';
  document.head.appendChild(s);
}

/* The admin table: tracked-caps header row, hairline row rules, court-050 hover, mono right-aligned
   numerics, typographic ▲▼ sort, pagination, empty state. ≤760px it collapses to stacked cards. */
export function DataTable({columns=[],rows=[],sort,onSort,page,pages,onPage,empty='NO ROWS',mobileTitleKey,onRowClick,style}){
  ensureStyles();
  const m=useMobile();
  const cell=(c,r)=>c.render?c.render(r):r[c.key];
  const head=(c)=>{
    const active=sort&&sort.key===c.key;
    const inner=[c.label,c.sortable&&h('span',{key:'s','aria-hidden':true,style:{fontFamily:'var(--font-mono)',fontSize:'0.5625rem',marginLeft:6,opacity:active?1:.35}},active?(sort.dir==='asc'?'\u25B2':'\u25BC'):'\u25B2\u25BC')];
    const st={fontFamily:'var(--font-sans)',fontSize:'var(--size-label-sm,.75rem)',fontWeight:700,letterSpacing:'var(--track-label,.107em)',textTransform:'uppercase',color:'var(--text-secondary,#46525E)'};
    return c.sortable?h('button',{type:'button',onClick:()=>onSort&&onSort(c.key,active&&sort.dir==='asc'?'desc':'asc'),style:{...st,background:'none',border:'none',cursor:'pointer',padding:0,whiteSpace:'nowrap'}},inner):h('span',{style:st},inner);
  };
  if(m)return h('div',{style:{display:'flex',flexDirection:'column',gap:12,...style}},
    rows.length===0?h('div',{style:{border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))'}},h(EmptyState,null,empty)):
    rows.map((r,i)=>h('div',{key:i,className:onRowClick?'mt-dt-row mt-dt-row--click':undefined,onClick:onRowClick?()=>onRowClick(r):undefined,
      role:onRowClick?'button':undefined,tabIndex:onRowClick?0:undefined,
      onKeyDown:onRowClick?(e)=>{if(e.key==='Enter')onRowClick(r);}:undefined,
      style:{background:'var(--white,#fff)',border:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',padding:'14px 16px',display:'flex',flexDirection:'column',gap:8}},
      h('div',{style:{fontFamily:'var(--font-sans)',fontSize:'var(--size-body-sm,.875rem)',fontWeight:600,color:'var(--ink,#1B1B1B)'}},r[mobileTitleKey||columns[0].key]),
      h('div',{style:{display:'grid',gridTemplateColumns:'auto 1fr',gap:'4px 16px'}},
        columns.filter(c=>c.key!==(mobileTitleKey||columns[0].key)).map(c=>h(React.Fragment,{key:c.key},
          h('span',{style:{fontFamily:'var(--font-mono)',fontSize:'0.625rem',letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-secondary,#46525E)',paddingTop:2}},c.label),
          h('span',{style:{fontFamily:c.numeric?'var(--font-mono)':'var(--font-sans)',fontSize:'0.8125rem',color:'var(--ink,#1B1B1B)'}},cell(c,r))))))),
    pages>1&&h('div',{style:{display:'flex',justifyContent:'flex-end'}},h(Pagination,{page,pages,onChange:onPage})));
  return h('div',{style},
    h('table',{style:{width:'100%',borderCollapse:'collapse'}},
      h('thead',null,h('tr',null,columns.map(c=>h('th',{key:c.key,'aria-sort':sort&&sort.key===c.key?(sort.dir==='asc'?'ascending':'descending'):undefined,
        style:{textAlign:c.numeric?'right':'left',padding:'10px 12px',borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',whiteSpace:'nowrap'}},head(c))))),
      h('tbody',null,rows.map((r,i)=>h('tr',{key:i,className:'mt-dt-row'+(onRowClick?' mt-dt-row--click':''),onClick:onRowClick?()=>onRowClick(r):undefined,
        style:{borderBottom:'1px solid var(--border-hairline,rgba(27,27,27,0.16))',transition:'background var(--dur-fast,120ms) var(--ease-out,ease)'}},
        columns.map(c=>h('td',{key:c.key,style:{padding:'12px 12px',textAlign:c.numeric?'right':'left',
          fontFamily:c.numeric||c.mono?'var(--font-mono)':'var(--font-sans)',
          fontSize:c.numeric||c.mono?'0.8125rem':'var(--size-body-sm,.875rem)',color:'var(--ink,#1B1B1B)',whiteSpace:'nowrap'}},cell(c,r))))))),
    rows.length===0&&h(EmptyState,null,empty),
    pages>1&&h('div',{style:{display:'flex',justifyContent:'flex-end',paddingTop:8}},h(Pagination,{page,pages,onChange:onPage})));
}

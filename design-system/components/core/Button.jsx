import React from 'react';

function ensureStyles(){
  if(typeof document==='undefined'||document.getElementById('mt-btn-styles'))return;
  const s=document.createElement('style');s.id='mt-btn-styles';
  s.textContent=`
.mt-btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:var(--size-action,48px);padding:0 28px;border-radius:var(--radius-action,999px);font-family:var(--font-sans);font-size:var(--size-label,.8125rem);font-weight:700;letter-spacing:var(--track-label,.107em);text-transform:uppercase;text-decoration:none;cursor:pointer;border:1.5px solid transparent;transition:background var(--dur-fast,120ms) var(--ease-out),color var(--dur-fast,120ms) var(--ease-out),border-color var(--dur-fast,120ms) var(--ease-out),transform var(--dur-fast,120ms) var(--ease-out);-webkit-tap-highlight-color:transparent;box-sizing:border-box}
.mt-btn:active{transform:translateY(1px)}
.mt-btn--sm{height:var(--size-action-sm,36px);padding:0 20px;font-size:var(--size-label-sm,.75rem)}
.mt-btn--primary{background:var(--accent-present,#E8A33D);color:var(--ink,#1B1B1B);border-color:var(--accent-present,#E8A33D)}
.mt-btn--primary:hover{background:var(--accent-present-hover,#C77F14);border-color:var(--accent-present-hover,#C77F14)}
.mt-btn--secondary{background:transparent;color:var(--ink,#1B1B1B);border-color:var(--ink,#1B1B1B)}
.mt-btn--secondary:hover{background:var(--ink,#1B1B1B);color:var(--line-white,#F7F7F7)}
.mt-btn--secondary.mt-btn--field{color:var(--line-white,#F7F7F7);border-color:var(--line-white,#F7F7F7)}
.mt-btn--secondary.mt-btn--field:hover{background:var(--line-white,#F7F7F7);color:var(--court-800,#1C3655)}
.mt-btn--ghost{background:transparent;color:var(--ink,#1B1B1B);border-color:transparent;padding:0 8px}
.mt-btn--ghost:hover{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px;text-decoration-color:var(--court-500,#2B5680)}
.mt-btn--ghost.mt-btn--field{color:var(--line-white,#F7F7F7)}
.mt-btn--ghost.mt-btn--field:hover{text-decoration-color:var(--now,#E8A33D)}
.mt-btn--field:focus-visible{outline-color:var(--focus-on-dark,#E8A33D)}
.mt-btn[disabled],.mt-btn--disabled{opacity:.45;pointer-events:none}`;
  document.head.appendChild(s);
}

/* Actions are pills — the path a circle sweeps through time. One radius for actions; everything else square. */
export function Button({variant='primary',size='md',onField=false,href,onClick,disabled=false,type='button',children,style}){
  ensureStyles();
  const cls=['mt-btn',`mt-btn--${variant}`,size==='sm'?'mt-btn--sm':'',onField?'mt-btn--field':'',disabled&&href?'mt-btn--disabled':''].filter(Boolean).join(' ');
  if(href)return React.createElement('a',{href,className:cls,onClick,style,'aria-disabled':disabled||undefined},children);
  return React.createElement('button',{type,className:cls,onClick,disabled,style},children);
}

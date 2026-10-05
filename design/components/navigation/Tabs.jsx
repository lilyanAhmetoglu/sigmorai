import React from 'react';
export function Tabs({items=[],value,onChange}){
  return <div role="tablist" style={{display:'flex',gap:6,flexWrap:'wrap'}}>{items.map(it=>{const on=it===value;return <button key={it} role="tab" aria-selected={on} onClick={()=>onChange&&onChange(it)} style={{background:on?'var(--ink-100)':'var(--surface-2)',color:on?'var(--ink-950)':'var(--text-2)',border:0,borderRadius:0,padding:'8px 14px',font:'11px var(--font-hud)',letterSpacing:'.06em',cursor:'pointer',boxShadow:'var(--notch-outline)',transform:on?'translateY(-2px)':'none'}}>{it}</button>;})}</div>;
}
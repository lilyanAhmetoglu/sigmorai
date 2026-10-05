import React from 'react';
export function XPBar({value=0,max=100,color='var(--spark-500)',label,segments=20,height=16}){
  const filled=Math.round(Math.min(1,value/max)*segments);
  return <div style={{display:'flex',flexDirection:'column',gap:6}}>
    {label&&<div style={{display:'flex',justifyContent:'space-between',font:'11px var(--font-hud)',letterSpacing:'.06em',color:'var(--text-2)'}}><span>{label}</span><span style={{color}}>{value}/{max}</span></div>}
    <div style={{display:'grid',gridTemplateColumns:`repeat(${segments},1fr)`,gap:2,padding:3,background:'var(--ink-950)',height}}>
      {Array.from({length:segments},(_,i)=><div key={i} style={{background:i<filled?color:'var(--ink-800)',boxShadow:i<filled?'inset 0 3px 0 rgba(255,255,255,.3)':'none'}}/>)}
    </div></div>;
}
import React from 'react';
export function LevelNode({index,status='locked',color='var(--ember-500)',label,onClick,boss}){
  const s=boss?64:48;const bg=status==='locked'?'var(--ink-700)':status==='done'?'var(--mint-500)':color;
  return <button onClick={status==='locked'?undefined:onClick} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,background:'none',border:0,padding:0,cursor:status==='locked'?'default':'pointer'}}>
    <span style={{width:s,height:s,display:'grid',placeItems:'center',background:bg,color:status==='locked'?'var(--ink-400)':'var(--ink-950)',font:`700 ${boss?22:18}px var(--font-display)`,boxShadow:`var(--bevel),var(--notch-outline)${status==='current'?',0 0 0 7px var(--spark-300)':''}`}}>{status==='locked'?'·':status==='done'?'✓':index}</span>
    {label&&<span style={{font:'10px var(--font-hud)',letterSpacing:'.06em',color:status==='locked'?'var(--text-3)':'var(--text-1)',maxWidth:96,textAlign:'center'}}>{label}</span>}
  </button>;
}
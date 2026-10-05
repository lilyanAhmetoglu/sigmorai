import React from 'react';
const K={xp:'var(--spark-500)',success:'var(--mint-500)',info:'var(--byte-500)',danger:'var(--glitch-500)'};
export function Toast({kind='info',title,children}){
  return <div role="status" style={{display:'flex',gap:12,alignItems:'center',background:'var(--surface-3)',color:'var(--text-1)',padding:'12px 16px',boxShadow:`var(--notch-outline),var(--shadow-drop),inset 6px 0 0 ${K[kind]}`,margin:3,maxWidth:360}}>
    <div style={{display:'flex',flexDirection:'column',gap:4,paddingLeft:6}}><span style={{font:'12px var(--font-hud)',letterSpacing:'.06em',color:K[kind]}}>{title}</span>{children&&<span style={{font:'14px/1.4 var(--font-body)',color:'var(--text-2)'}}>{children}</span>}</div></div>;
}
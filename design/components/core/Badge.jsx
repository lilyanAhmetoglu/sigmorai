import React from 'react';
const K={xp:'var(--spark-500)',success:'var(--mint-500)',info:'var(--byte-500)',danger:'var(--glitch-500)',math:'var(--rune-500)',neutral:'var(--ink-300)',new:'var(--ember-500)'};
export function Badge({kind='neutral',children}){
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,background:K[kind]||K.neutral,color:'var(--ink-950)',font:'11px/1 var(--font-hud)',letterSpacing:'.06em',padding:'5px 8px',textTransform:'uppercase',boxShadow:'inset -2px -2px 0 rgba(0,0,0,.25)'}}>{children}</span>;
}
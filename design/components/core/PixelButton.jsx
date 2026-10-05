import React from 'react';
const V={primary:['var(--ember-500)','var(--ink-950)'],xp:['var(--spark-500)','var(--ink-950)'],success:['var(--mint-500)','var(--ink-950)'],secondary:['var(--ink-600)','var(--ink-100)'],danger:['var(--glitch-500)','var(--ink-950)'],ghost:['transparent','var(--ink-100)']};
const S={sm:['6px 12px',12],md:['10px 18px',14],lg:['14px 26px',18]};
export function PixelButton({variant='primary',size='md',disabled,icon,children,onClick,full}){
  const [p,setP]=React.useState(false);const [bg,fg]=V[variant]||V.primary;const [pad,fs]=S[size]||S.md;
  return <button disabled={disabled} onClick={onClick} onPointerDown={()=>setP(true)} onPointerUp={()=>setP(false)} onPointerLeave={()=>setP(false)}
    style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,width:full?'100%':undefined,padding:pad,border:0,borderRadius:0,cursor:disabled?'not-allowed':'pointer',
    background:disabled?'var(--ink-700)':bg,color:disabled?'var(--ink-400)':fg,font:`700 ${fs}px var(--font-display)`,letterSpacing:'.02em',textTransform:'uppercase',
    boxShadow:variant==='ghost'?'inset 0 0 0 3px var(--ink-500)':`${p?'var(--bevel-pressed)':'var(--bevel)'},var(--notch-outline)`,
    transform:p&&!disabled?'translate(2px,2px)':'none',transition:'transform var(--dur-1) var(--ease-snap)'}}>{icon}{children}</button>;
}
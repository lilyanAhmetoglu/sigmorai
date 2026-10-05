import React from 'react';
const T={default:['var(--surface-2)','var(--text-1)'],sunken:['var(--surface-1)','var(--text-1)'],story:['var(--surface-story)','var(--text-story)'],raised:['var(--surface-3)','var(--text-1)']};
export function Panel({tone='default',title,accent,children,padding=20}){
  const [bg,fg]=T[tone]||T.default;
  return <section style={{position:'relative',background:bg,color:fg,padding,boxShadow:'var(--notch-outline),var(--shadow-drop-lg)',margin:3}}>
    {title&&<div style={{position:'absolute',top:-14,left:16,background:accent||'var(--ember-500)',color:'var(--ink-950)',font:'12px var(--font-hud)',letterSpacing:'.06em',padding:'4px 10px',boxShadow:'var(--notch-outline)'}}>{title}</div>}
    {children}</section>;
}
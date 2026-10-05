import React from 'react';
export function TestResult({name,status='pending',detail}){
  const m={pass:['var(--mint-500)','PASS'],fail:['var(--glitch-500)','FAIL'],pending:['var(--ink-500)','····'],running:['var(--spark-500)','RUN ']}[status];
  return <div style={{display:'flex',gap:12,alignItems:'baseline',padding:'8px 12px',background:'var(--ink-950)',font:'13px/1.5 var(--font-code)',color:'var(--ink-200)'}}>
    <span style={{flex:'none',background:m[0],color:'var(--ink-950)',font:'10px/1 var(--font-hud)',padding:'4px 6px'}}>{m[1]}</span>
    <span style={{minWidth:0}}>{name}{detail&&<span style={{display:'block',color:status==='fail'?'var(--glitch-300)':'var(--text-3)'}}>{detail}</span>}</span></div>;
}
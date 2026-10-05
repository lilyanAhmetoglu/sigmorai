import React from 'react';
export function Choice({label,checked,onChange,type='checkbox',state}){
  const ring=state==='correct'?'var(--mint-500)':state==='wrong'?'var(--glitch-500)':checked?'var(--spark-500)':'var(--ink-600)';
  return <button type="button" onClick={()=>onChange&&onChange(!checked)} style={{display:'flex',alignItems:'center',gap:12,width:'100%',textAlign:'left',background:checked?'var(--surface-3)':'var(--surface-2)',color:'var(--text-1)',border:0,borderRadius:0,padding:'12px 14px',cursor:'pointer',font:'16px var(--font-body)',boxShadow:`0 0 0 3px ${ring}`}}>
    <span style={{width:18,height:18,flex:'none',background:'var(--ink-950)',boxShadow:'0 0 0 2px var(--ink-500)',display:'grid',placeItems:'center'}}>{checked&&<span style={{width:type==='radio'?8:10,height:type==='radio'?8:10,background:ring}}/>}</span>{label}</button>;
}
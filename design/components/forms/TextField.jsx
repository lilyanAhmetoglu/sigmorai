import React from 'react';
export function TextField({label,type='text',value,onChange,placeholder,error,hint}){
  const [f,setF]=React.useState(false);
  return <label style={{display:'flex',flexDirection:'column',gap:6}}>
    {label&&<span style={{font:'11px var(--font-hud)',letterSpacing:'.06em',color:'var(--text-2)'}}>{label}</span>}
    <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange&&onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{background:'var(--ink-950)',color:'var(--text-1)',border:0,borderRadius:0,outline:'none',padding:'12px 14px',font:'16px var(--font-body)',
      boxShadow:`inset 3px 3px 0 rgba(0,0,0,.5),0 0 0 3px ${error?'var(--glitch-500)':f?'var(--spark-500)':'var(--ink-600)'}`}}/>
    {(error||hint)&&<span style={{font:'12px var(--font-body)',color:error?'var(--glitch-300)':'var(--text-3)'}}>{error||hint}</span>}
  </label>;
}
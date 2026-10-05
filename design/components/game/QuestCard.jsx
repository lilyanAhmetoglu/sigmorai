import React from 'react';
export function QuestCard({realm,title,summary,xp,minutes,source,status='open',color='var(--ember-500)',onStart}){
  return <article style={{background:'var(--surface-2)',boxShadow:'var(--notch-outline),var(--shadow-drop)',margin:3,display:'flex',flexDirection:'column'}}>
    <div style={{height:6,background:color}}/>
    <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
      <div style={{font:'10px var(--font-hud)',letterSpacing:'.06em',color}}>{realm}</div>
      <div style={{font:'600 20px/1.2 var(--font-display)',color:'var(--text-1)'}}>{title}</div>
      {summary&&<p style={{margin:0,font:'14px/1.5 var(--font-body)',color:'var(--text-2)',textWrap:'pretty'}}>{summary}</p>}
      <div style={{display:'flex',gap:12,flexWrap:'wrap',font:'10px var(--font-hud)',letterSpacing:'.06em',color:'var(--text-3)'}}>{xp&&<span style={{color:'var(--spark-500)'}}>+{xp} XP</span>}{minutes&&<span>{minutes} MIN</span>}{source&&<span>SRC · {source}</span>}</div>
      {onStart&&<button onClick={onStart} style={{alignSelf:'flex-start',marginTop:4,background:status==='done'?'var(--ink-600)':color,color:status==='done'?'var(--ink-100)':'var(--ink-950)',border:0,borderRadius:0,padding:'8px 14px',font:'700 12px var(--font-display)',textTransform:'uppercase',cursor:'pointer',boxShadow:'var(--bevel),var(--notch-outline)'}}>{status==='done'?'Replay':'Start'}</button>}
    </div></article>;
}
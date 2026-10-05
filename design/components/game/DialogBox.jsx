import React from 'react';
export function DialogBox({speaker,portrait,children,onNext,nextLabel='▸ NEXT'}){
  return <div style={{display:'flex',gap:16,alignItems:'flex-start',background:'var(--surface-story)',color:'var(--text-story)',padding:18,boxShadow:'var(--notch-outline),var(--shadow-drop-lg),inset 0 0 0 3px var(--parchment-400)',margin:3}}>
    {portrait&&<div style={{flex:'none'}}>{portrait}</div>}
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:8}}>
      {speaker&&<div style={{font:'12px var(--font-hud)',letterSpacing:'.06em',color:'var(--ember-700)'}}>{speaker}</div>}
      <div style={{font:'17px/1.55 var(--font-body)',textWrap:'pretty'}}>{children}</div>
      {onNext&&<button onClick={onNext} style={{alignSelf:'flex-end',background:'none',border:0,font:'12px var(--font-hud)',color:'var(--parchment-700)',cursor:'pointer'}}>{nextLabel}</button>}
    </div></div>;
}
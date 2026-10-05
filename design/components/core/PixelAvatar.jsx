import React from 'react';
const PAL=[['#FF6B35','#FFC53D'],['#3EE08F','#40C4FF'],['#A07BFF','#FF4F8B'],['#40C4FF','#FFE08A'],['#FF4F8B','#A07BFF']];
function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export function PixelAvatar({seed='player',src,size=64,level,frame='var(--ember-500)'}){
  const h=hash(seed),[a,b]=PAL[h%PAL.length];let cells=[];let r=h;
  for(let y=0;y<8;y++)for(let x=0;x<4;x++){r=(Math.imul(r,1103515245)+12345)>>>0;const on=y>0&&y<7&&(r>>16)%3!==0;const c=on?((r>>8)%4===0?b:a):null;cells.push([x,y,c],[7-x,y,c]);}
  return <div style={{position:'relative',width:size,height:size,padding:4,background:'var(--ink-950)',boxShadow:`0 0 0 3px ${frame}`}}>
    {src?<img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',imageRendering:'pixelated',display:'block'}}/>:
    <svg viewBox="0 0 8 8" width="100%" height="100%" shapeRendering="crispEdges" style={{display:'block',background:'var(--ink-800)'}}>{cells.filter(c=>c[2]).map(([x,y,c],i)=><rect key={i} x={x} y={y} width="1" height="1" fill={c}/>)}</svg>}
    {level!=null&&<span style={{position:'absolute',right:-8,bottom:-8,background:'var(--spark-500)',color:'var(--ink-950)',font:'10px/1 var(--font-hud)',padding:'4px 5px',boxShadow:'var(--notch-outline)'}}>LV{level}</span>}
  </div>;
}
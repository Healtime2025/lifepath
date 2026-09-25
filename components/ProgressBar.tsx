export function ProgressBar({value}:{value:number}){const v=Math.max(0,Math.min(100,value));return <div className="progress" aria-label={`${v}% complete`}><span style={{width:`${v}%`}}/></div>}

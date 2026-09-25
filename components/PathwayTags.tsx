import { pathwayLabel } from '@/lib/matching';
export function PathwayTags({items}:{items:string[]}){return <div className="tagrow">{(items||[]).map(x=><span className="pill" key={x}>{pathwayLabel(x)}</span>)}</div>}

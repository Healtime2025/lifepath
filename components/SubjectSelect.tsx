'use client';
import { subjectGroups } from '@/lib/subjects';
export function SubjectSelect({value,onChange,className='select'}:{value:string,onChange:(v:string)=>void,className?:string}){
 return <select className={className} value={value} onChange={e=>onChange(e.target.value)}><option value="">Choose subject</option>{subjectGroups.map(g=><optgroup label={g.label} key={g.label}>{g.subjects.map(s=><option key={s} value={s}>{s}</option>)}</optgroup>)}</select>
}

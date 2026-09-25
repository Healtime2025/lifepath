'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubjectSelect } from '@/components/SubjectSelect';
const provinces=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];
export function OnboardingForm({profile,marks}:{profile:any,marks:any[]}){
 const router=useRouter();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const [rows,setRows]=useState<{subject:string;mark:string}[]>(marks.length?marks.map(m=>({subject:m.subject,mark:String(m.mark)})):[{subject:'Mathematics',mark:''},{subject:'English First Additional Language',mark:''}]);
 function add(){setRows([...rows,{subject:'',mark:''}])} function upd(i:number,k:'subject'|'mark',v:string){setRows(rows.map((r,j)=>j===i?{...r,[k]:v}:r))}
 async function save(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const fd=new FormData(e.currentTarget);const p={firstName:fd.get('firstName'),lastName:fd.get('lastName'),grade:fd.get('grade'),province:fd.get('province'),schoolName:fd.get('schoolName'),highestGradeCompleted:fd.get('highestGradeCompleted')};
 const r1=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});if(!r1.ok){setError((await r1.json()).error||'Could not save profile');setBusy(false);return}
 const valid=rows.filter(r=>r.subject&&r.mark!==''&&Number(r.mark)>=0&&Number(r.mark)<=100);const r2=await fetch('/api/marks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({grade:fd.get('grade'),period:'latest',marks:valid})});if(!r2.ok){setError((await r2.json()).error||'Could not save marks');setBusy(false);return}setBusy(false);router.push('/assessment');router.refresh();}
 return <form className="form" onSubmit={save}>
  <div className="grid grid-2"><div className="field"><label>First name</label><input className="input" name="firstName" defaultValue={profile?.first_name||''} required/></div><div className="field"><label>Last name</label><input className="input" name="lastName" defaultValue={profile?.last_name||''}/></div></div>
  <div className="grid grid-2"><div className="field"><label>Current grade / status</label><select className="select" name="grade" defaultValue={profile?.grade||'Grade 10'}>{['Grade 9','Grade 10','Grade 11','Grade 12','Finished school','Other'].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Province</label><select className="select" name="province" defaultValue={profile?.province||''}><option value="">Choose province</option>{provinces.map(x=><option key={x}>{x}</option>)}</select></div></div>
  <div className="grid grid-2"><div className="field"><label>School (optional)</label><input className="input" name="schoolName" defaultValue={profile?.school_name||''}/></div><div className="field"><label>Highest grade completed (optional)</label><input className="input" name="highestGradeCompleted" defaultValue={profile?.highest_grade_completed||''} placeholder="e.g. Grade 10"/></div></div>
  <div className="card" style={{boxShadow:'none'}}><div className="section-head" style={{marginBottom:10}}><div><h3>Latest subjects and marks</h3><p className="muted" style={{margin:'5px 0 0'}}>Full DBE-aligned subject catalogue, including languages, academic, technical and Technical Occupational subjects.</p></div><button type="button" className="btn btn-soft" onClick={add}>+ Add subject</button></div>
   <div className="form">{rows.map((r,i)=><div className="subject-row" key={i}><SubjectSelect value={r.subject} onChange={v=>upd(i,'subject',v)}/><input className="input" type="number" min="0" max="100" value={r.mark} onChange={e=>upd(i,'mark',e.target.value)} placeholder="%"/><button type="button" className="btn btn-ghost" onClick={()=>setRows(rows.filter((_,j)=>j!==i))}>×</button></div>)}</div>
  </div>{error&&<div className="notice">{error}</div>}<button className="btn btn-primary" disabled={busy}>{busy?'Saving…':'Save and continue to assessment'}</button>
 </form>
}

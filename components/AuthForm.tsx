'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
export function AuthForm({mode}:{mode:'login'|'register'}){
  const router=useRouter(); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError(''); const fd=new FormData(e.currentTarget); const payload=Object.fromEntries(fd.entries());
    const res=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await res.json().catch(()=>({})); setBusy(false); if(!res.ok){setError(data.error||'Something went wrong');return} router.push(mode==='register'?'/onboarding':'/dashboard'); router.refresh(); }
  return <form className="form" onSubmit={submit}>
    {mode==='register'&&<div className="field"><label>First name</label><input className="input" name="firstName" autoComplete="given-name" required maxLength={80}/></div>}
    <div className="field"><label>Email</label><input className="input" name="email" type="email" autoComplete="email" required/></div>
    <div className="field"><label>Password</label><input className="input" name="password" type="password" minLength={10} autoComplete={mode==='register'?'new-password':'current-password'} required/><small className="muted">{mode==='register'?'Use at least 10 characters.':''}</small></div>
    {mode==='register'&&<label style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:13,color:'#667085'}}><input type="checkbox" name="consent" value="yes" required style={{marginTop:3}}/>I agree to the LifePath terms and privacy notice and understand that career guidance supports my own decision-making.</label>}
    {error&&<div className="notice" style={{background:'#fff2f2',borderColor:'#ffd8d8',color:'#9b2c2c'}}>{error}</div>}
    <button className="btn btn-primary" disabled={busy}>{busy?'Please wait…':mode==='register'?'Create my LifePath':'Sign in'}</button>
  </form>
}

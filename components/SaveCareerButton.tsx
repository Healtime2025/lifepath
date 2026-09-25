'use client';
import { useState } from 'react';
export function SaveCareerButton({careerId}:{careerId:string}){const [saved,setSaved]=useState(false);const [busy,setBusy]=useState(false);async function go(){setBusy(true);const r=await fetch('/api/careers/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({careerId})});setBusy(false);if(r.ok)setSaved(true)}return <button className="btn btn-soft" onClick={go} disabled={saved||busy}>{saved?'Saved ✓':busy?'Saving…':'Save career'}</button>}

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { createSession, hashPassword } from '@/lib/auth';
import { cleanEmail, cleanText } from '@/lib/http';
import { NextResponse } from 'next/server';

function validSignature(payload:string, signature:string, secret:string){
  const expected=createHmac('sha256',secret).update(payload).digest('hex');
  const a=Buffer.from(expected); const b=Buffer.from(signature||'');
  return a.length===b.length && timingSafeEqual(a,b);
}
function decodePayload(payload:string){
  const json=Buffer.from(payload,'base64url').toString('utf8');
  return JSON.parse(json);
}
export async function POST(req:Request){
  const secret=process.env.SCHOOLCORE_SHARED_SECRET;
  if(!secret) return NextResponse.json({error:'SchoolCore integration is not configured.'},{status:503});
  try{
    const contentType=req.headers.get('content-type')||'';
    let payload='',signature='';
    if(contentType.includes('application/json')){const b=await req.json();payload=String(b.payload||'');signature=String(b.signature||'');}
    else {const fd=await req.formData();payload=String(fd.get('payload')||'');signature=String(fd.get('signature')||'');}
    if(!payload||!validSignature(payload,signature,secret)) return NextResponse.json({error:'Invalid SchoolCore handoff signature.'},{status:401});
    const data=decodePayload(payload);
    const ts=Number(data.timestamp||0); if(!ts||Math.abs(Date.now()-ts)>5*60*1000) return NextResponse.json({error:'SchoolCore handoff expired.'},{status:401});
    const email=cleanEmail(data.email), first=cleanText(data.firstName,80), last=cleanText(data.lastName,80), grade=cleanText(data.grade,40), province=cleanText(data.province,60), schoolName=cleanText(data.schoolName,160), learnerId=cleanText(data.learnerId,160), schoolId=cleanText(data.schoolId,160);
    if(!email||!learnerId) return NextResponse.json({error:'SchoolCore learner email and learner ID are required.'},{status:400});
    const sql=db();let rows=await sql`SELECT id FROM users WHERE email=${email} LIMIT 1`;let userId:string;
    if(!rows.length){const randomPassword=randomBytes(48).toString('base64url');const hash=await hashPassword(randomPassword);const created=await sql`INSERT INTO users(email,password_hash,role) VALUES(${email},${hash},'learner') RETURNING id`;userId=created[0].id;} else userId=rows[0].id;
    await sql`INSERT INTO learner_profiles(user_id,first_name,last_name,grade,province,school_name,onboarding_complete,updated_at) VALUES(${userId},${first},${last},${grade},${province},${schoolName},true,now()) ON CONFLICT(user_id) DO UPDATE SET first_name=COALESCE(NULLIF(EXCLUDED.first_name,''),learner_profiles.first_name),last_name=COALESCE(NULLIF(EXCLUDED.last_name,''),learner_profiles.last_name),grade=COALESCE(NULLIF(EXCLUDED.grade,''),learner_profiles.grade),province=COALESCE(NULLIF(EXCLUDED.province,''),learner_profiles.province),school_name=COALESCE(NULLIF(EXCLUDED.school_name,''),learner_profiles.school_name),onboarding_complete=true,updated_at=now()`;
    await sql`INSERT INTO schoolcore_links(user_id,schoolcore_learner_id,schoolcore_school_id,last_sync_at) VALUES(${userId},${learnerId},${schoolId},now()) ON CONFLICT(user_id) DO UPDATE SET schoolcore_learner_id=EXCLUDED.schoolcore_learner_id,schoolcore_school_id=EXCLUDED.schoolcore_school_id,last_sync_at=now()`;
    if(Array.isArray(data.marks)) for(const item of data.marks.slice(0,30)){const subject=cleanText(item.subject,100),mark=Number(item.mark),period=cleanText(item.period,40)||'schoolcore',mgrade=cleanText(item.grade,40)||grade||'Current';if(subject&&Number.isFinite(mark)&&mark>=0&&mark<=100)await sql`INSERT INTO learner_marks(user_id,subject,mark,grade,period,source) VALUES(${userId},${subject},${mark},${mgrade},${period},'schoolcore') ON CONFLICT(user_id,subject,grade,period) DO UPDATE SET mark=EXCLUDED.mark,source='schoolcore',recorded_at=now()`;}
    await sql`INSERT INTO progress_events(user_id,event_type,title,metadata) VALUES(${userId},'schoolcore_sync','SchoolCore results synced',${JSON.stringify({schoolId,learnerId})}::jsonb)`;
    await createSession(userId);
    return NextResponse.redirect(new URL('/dashboard',req.url),303);
  }catch(e){console.error(e);return NextResponse.json({error:'SchoolCore handoff failed.'},{status:500});}
}

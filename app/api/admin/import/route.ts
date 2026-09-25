import { requireAdmin } from '@/lib/auth';import { db } from '@/lib/db';import { bad,cleanText,cleanUrl,ok } from '@/lib/http';
const slugify=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140);
export async function POST(req:Request){try{const u=await requireAdmin();const b=await req.json();const type=cleanText(b.importType,40),sourceName=cleanText(b.sourceName,180),sourceUrl=cleanUrl(b.sourceUrl)||null,records=Array.isArray(b.records)?b.records:[];if(!['institutions','qualifications','career_qualifications','programmes','funding'].includes(type)||!sourceName||!records.length)return bad('Choose an import type, source and at least one record.');if(records.length>2000)return bad('Import batches are limited to 2,000 records.');const sql=db();let upserted=0;const errors:any[]=[];for(let idx=0;idx<records.length;idx++){const r=records[idx]||{};try{if(type==='institutions'){const name=cleanText(r.name,240);if(!name)throw new Error('name required');const slug=cleanText(r.slug,160)||slugify(name);const it=cleanText(r.institution_type||r.type,60)||'skills_provider';const province=cleanText(r.province,80)||null,city=cleanText(r.city,100)||null,website=cleanUrl(r.website_url||r.website)||null,apply=cleanUrl(r.application_url)||null,status=['verified','needs_verification','inactive'].includes(r.verification_status)?r.verification_status:'needs_verification',body=cleanText(r.verification_body,180)||null,reg=cleanText(r.registration_number,120)||null,vurl=cleanUrl(r.verification_source_url)||sourceUrl;await sql`INSERT INTO institutions(name,slug,institution_type,province,city,website_url,application_url,verification_status,verification_body,registration_number,verification_source_url,verification_checked_at,public_institution,active) VALUES(${name},${slug},${it},${province},${city},${website},${apply},${status},${body},${reg},${vurl},CASE WHEN ${status}='verified' THEN now() ELSE NULL END,${!!r.public_institution},${r.active!==false}) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,institution_type=EXCLUDED.institution_type,province=EXCLUDED.province,city=EXCLUDED.city,website_url=EXCLUDED.website_url,application_url=EXCLUDED.application_url,verification_status=EXCLUDED.verification_status,verification_body=EXCLUDED.verification_body,registration_number=EXCLUDED.registration_number,verification_source_url=EXCLUDED.verification_source_url,verification_checked_at=EXCLUDED.verification_checked_at,public_institution=EXCLUDED.public_institution,active=EXCLUDED.active,updated_at=now()`;}
else if(type==='qualifications'){const title=cleanText(r.title,260),qt=cleanText(r.qualification_type||r.type,100);if(!title||!qt)throw new Error('title and qualification_type required');const nqf=Number.isFinite(Number(r.nqf_level))?Number(r.nqf_level):null,saqa=cleanText(r.saqa_id,80)||'',field=cleanText(r.field,160)||null,duration=cleanText(r.duration_text,120)||null,surl=cleanUrl(r.source_url)||sourceUrl;await sql`INSERT INTO qualifications(title,qualification_type,nqf_level,saqa_id,field,duration_text,source_url) VALUES(${title},${qt},${nqf},${saqa},${field},${duration},${surl}) ON CONFLICT(title,qualification_type,saqa_id) DO UPDATE SET nqf_level=EXCLUDED.nqf_level,field=EXCLUDED.field,duration_text=EXCLUDED.duration_text,source_url=EXCLUDED.source_url,active=true`;}
else if(type==='career_qualifications'){
const careerSlug=cleanText(r.career_slug,160),
qualificationTitle=cleanText(r.qualification_title,260),
qualificationType=cleanText(r.qualification_type||r.type,100),
saqaId=cleanText(r.saqa_id,80)||'',
relevance=cleanText(r.relevance,40)||'primary';

if(!careerSlug||!qualificationTitle||!qualificationType)
throw new Error('career_slug, qualification_title and qualification_type required');

const career=await sql`
SELECT id
FROM careers
WHERE slug=${careerSlug}
AND active=true
LIMIT 1`;

if(!career.length)
throw new Error('career not found');

const qualification=await sql`
SELECT id
FROM qualifications
WHERE title=${qualificationTitle}
AND qualification_type=${qualificationType}
AND saqa_id=${saqaId}
AND active=true
LIMIT 1`;

if(!qualification.length)
throw new Error('qualification not found');

await sql`
INSERT INTO career_qualifications(
career_id,
qualification_id,
relevance
)
VALUES(
${career[0].id},
${qualification[0].id},
${relevance}
)
ON CONFLICT(career_id,qualification_id)
DO UPDATE SET relevance=EXCLUDED.relevance`;
}
else if(type==='programmes'){
const institutionSlug=cleanText(r.institution_slug,160),
name=cleanText(r.name,260);

if(!institutionSlug||!name)
throw new Error('institution_slug and name required');

const inst=await sql`
SELECT id
FROM institutions
WHERE slug=${institutionSlug}
AND active=true
LIMIT 1`;

if(!inst.length)
throw new Error('institution not found');

let qualificationId:string|null=null;

const qualificationTitle=cleanText(r.qualification_title,260);
const qualificationType=cleanText(r.qualification_type,100);
const saqaId=cleanText(r.saqa_id,80)||'';

if(qualificationTitle||qualificationType||saqaId){
if(!qualificationTitle||!qualificationType)
throw new Error('qualification_title and qualification_type required when linking a qualification');

const qualification=await sql`
SELECT id
FROM qualifications
WHERE title=${qualificationTitle}
AND qualification_type=${qualificationType}
AND saqa_id=${saqaId}
AND active=true
LIMIT 1`;

if(!qualification.length)
throw new Error('qualification not found');

qualificationId=String(qualification[0].id);
}

const year=Number.isFinite(Number(r.academic_year))
?Number(r.academic_year)
:new Date().getFullYear();

const faculty=cleanText(r.faculty,180)||null,
campus=cleanText(r.campus,160)||null,
apply=cleanUrl(r.application_url)||null,
purl=cleanUrl(r.programme_url)||null,
surl=cleanUrl(r.source_url)||sourceUrl,
requirements=typeof r.requirements==='object'&&r.requirements
?r.requirements:{};

await sql`
INSERT INTO programmes(
institution_id,
qualification_id,
name,
faculty,
campus,
application_url,
programme_url,
requirements,
academic_year,
verified_at,
source_url
)
VALUES(
${inst[0].id},
${qualificationId},
${name},
${faculty},
${campus},
${apply},
${purl},
${JSON.stringify(requirements)}::jsonb,
${year},
now(),
${surl}
)
ON CONFLICT(institution_id,name,academic_year)
DO UPDATE SET
qualification_id=EXCLUDED.qualification_id,
faculty=EXCLUDED.faculty,
campus=EXCLUDED.campus,
application_url=EXCLUDED.application_url,
programme_url=EXCLUDED.programme_url,
requirements=EXCLUDED.requirements,
verified_at=now(),
source_url=EXCLUDED.source_url,
active=true`;
}
else if(type==='funding'){const name=cleanText(r.name,240),provider=cleanText(r.provider,220),ft=cleanText(r.funding_type||r.type,80);if(!name||!provider||!ft)throw new Error('name, provider and funding_type required');const summary=cleanText(r.summary,1200)||'Funding opportunity',paths=Array.isArray(r.eligible_pathways)?r.eligible_pathways.slice(0,20).map((x:any)=>cleanText(x,60)).filter(Boolean):[],fields=Array.isArray(r.eligible_fields)?r.eligible_fields.slice(0,30).map((x:any)=>cleanText(x,100)).filter(Boolean):[],eligibility=typeof r.eligibility==='object'&&r.eligibility?r.eligibility:{},apply=cleanUrl(r.application_url)||null,info=cleanUrl(r.info_url)||sourceUrl,opens=cleanText(r.opens_on,20)||null,closes=cleanText(r.closes_on,20)||null;await sql`INSERT INTO funding_opportunities(name,provider,funding_type,summary,eligible_pathways,eligible_fields,eligibility,application_url,info_url,opens_on,closes_on,recurring,verified,verification_source_url,verified_at) VALUES(${name},${provider},${ft},${summary},${paths},${fields},${JSON.stringify(eligibility)}::jsonb,${apply},${info},${opens},${closes},${!!r.recurring},${r.verified!==false},${sourceUrl||info},now()) ON CONFLICT(name,provider) DO UPDATE SET funding_type=EXCLUDED.funding_type,summary=EXCLUDED.summary,eligible_pathways=EXCLUDED.eligible_pathways,eligible_fields=EXCLUDED.eligible_fields,eligibility=EXCLUDED.eligibility,application_url=EXCLUDED.application_url,info_url=EXCLUDED.info_url,opens_on=EXCLUDED.opens_on,closes_on=EXCLUDED.closes_on,recurring=EXCLUDED.recurring,verified=EXCLUDED.verified,verification_source_url=EXCLUDED.verification_source_url,verified_at=now(),active=true`;}
upserted++;}catch(e:any){errors.push({index:idx,error:String(e.message||e).slice(0,300)});}}
await sql`INSERT INTO data_imports(actor_user_id,import_type,source_name,source_url,records_total,records_upserted,errors) VALUES(${u.id},${type},${sourceName},${sourceUrl},${records.length},${upserted},${JSON.stringify(errors.slice(0,100))}::jsonb)`;await sql`INSERT INTO audit_events(actor_user_id,action,entity_type,detail) VALUES(${u.id},'data_import',${type},${JSON.stringify({sourceName,sourceUrl,total:records.length,upserted,errors:errors.length})}::jsonb)`;return ok({total:records.length,upserted,errors});}catch(e:any){return bad(e.message==='FORBIDDEN'?'Admin access required.':e.message==='UNAUTHENTICATED'?'Sign in required.':'Import failed.',e.message==='FORBIDDEN'?403:e.message==='UNAUTHENTICATED'?401:500)}}



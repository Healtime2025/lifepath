import Link from 'next/link';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PathwayTags } from '@/components/PathwayTags';
import { SaveCareerButton } from '@/components/SaveCareerButton';
import { currentUser } from '@/lib/auth';
import { latestMarks } from '@/lib/learner';

function normaliseSubject(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]/g,'');
}

function learnerMark(
  marks:Record<string,number>,
  names:string[]
){
  for(const [subject,value] of Object.entries(marks)){
    const normalised=normaliseSubject(subject);

    if(names.some(name=>
      normalised===normaliseSubject(name)
    )){
      return Number(value);
    }
  }

  return null;
}

function requirementLabel(key:string,requirement:any){
  if(requirement?.subject){
    const subject=String(requirement.subject);

    if(
      key==='english' &&
      subject.toLowerCase().includes('english')
    ){
      return 'English';
    }

    return subject;
  }

  return key
    .split('_')
    .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
    .join(' ');
}

function requirementMarkNames(
  key:string,
  requirement:any
){
  const names:string[]=[];

  if(requirement?.subject){
    names.push(String(requirement.subject));
  }

  const aliases:Record<string,string[]>={
    english:[
      'English',
      'English Home Language',
      'English First Additional Language'
    ],
    mathematics:[
      'Mathematics'
    ],
    physical_sciences:[
      'Physical Sciences',
      'Physical Science'
    ],
    life_sciences:[
      'Life Sciences',
      'Life Science'
    ]
  };

  names.push(...(aliases[key]||[]));

  if(!names.length){
    names.push(
      key
        .split('_')
        .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
        .join(' ')
    );
  }

  return [...new Set(names)];
}

function programmeSubjectRequirements(req:any){
  if(!req || typeof req!=='object') return [];

  const metadataKeys=new Set([
    'aps',
    'note',
    'curriculum'
  ]);

  return Object.entries(req)
    .filter(([key,value])=>{
      if(metadataKeys.has(key)) return false;
      if(!value || typeof value!=='object') return false;

      const requirement=value as any;

      return (
        requirement.achievement_level!=null ||
        requirement.minimum_percent!=null ||
        requirement.subject
      );
    })
    .map(([key,requirement])=>({
      key,
      requirement
    }));
}

function achievementPercent(level:any){
  const n=Number(level);

  const minimums:Record<number,number>={
    1:0,
    2:30,
    3:40,
    4:50,
    5:60,
    6:70,
    7:80
  };

  return minimums[n] ?? null;
}

function RequirementRow({
  label,
  requirement,
  mark
}:{
  label:string;
  requirement:any;
  mark:number|null;
}){
  if(!requirement) return null;

  const level=Number(requirement.achievement_level);
  const minimum=achievementPercent(level);

  let status:string|null=null;
  let gap:number|null=null;

  if(mark!=null && minimum!=null){
    gap=Math.max(0,minimum-mark);

    status=mark>=minimum
      ? 'Your current mark meets this published minimum'
      : `Gap: ${Math.round(gap)} percentage points to the published minimum`;
  }

  return (
    <div className="timeline-item">
      <span className="dot">
        {mark!=null ? Math.round(mark) : level || '•'}
      </span>

      <div>
        <b>{label}</b>

        <div
          className="muted"
          style={{fontSize:13,lineHeight:1.55}}
        >
          {requirement.subject || label}

          {level
            ? ` · achievement level ${level}${minimum!=null ? ` (${minimum}%+)` : ''}`
            : ''}

          {mark!=null
            ? ` · your latest mark: ${Math.round(mark)}%`
            : ''}
        </div>

        {status && (
          <div
            style={{
              fontSize:12,
              marginTop:6,
              fontWeight:700
            }}
          >
            {mark!=null && minimum!=null && (
              <div
                style={{
                  display:'flex',
                  gap:12,
                  flexWrap:'wrap',
                  marginBottom:5
                }}
              >
                <span>
                  Current: {Math.round(mark)}%
                </span>

                <span>
                  Published minimum: {minimum}%
                </span>
              </div>
            )}

            <div>
              {mark!=null &&
               minimum!=null &&
               mark>=minimum
                ? '✓ '
                : ''}
              {status}
            </div>

            {gap!=null && gap>0 && (
              <div style={{marginTop:8}}>
                <Link
                  href="/subject-planner"
                  className="btn btn-soft"
                  style={{fontSize:12}}
                >
                  Work on this in Subject Planner →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function Page({
  params
}:{
  params:Promise<{slug:string}>
}){
  const {slug}=await params;
  const sql=db();

  const rows=await sql`
    SELECT *
    FROM careers
    WHERE slug=${slug}
      AND active=true
    LIMIT 1
  `;

  const c:any=rows[0];

  if(!c) notFound();

  const u=await currentUser().catch(()=>null);
  const marks:Record<string,number>=u
    ? await latestMarks(u.id)
    : {};

  /*
   * Exact verified programme chain:
   * career -> career_qualifications -> qualification
   * -> programme -> institution
   */
  const programmes=await sql`
    SELECT
      p.id,
      p.name,
      p.faculty,
      p.campus,
      p.academic_year,
      p.application_url,
      p.programme_url,
      p.requirements,
      p.verified_at,
      p.source_url,

      q.title AS qualification_title,
      q.qualification_type,
      q.nqf_level,
      q.saqa_id,
      q.source_url AS qualification_source_url,

      cq.relevance,

      i.name AS institution_name,
      i.slug AS institution_slug,
      i.institution_type,
      i.province,
      i.website_url,
      i.verification_status,
      i.verification_source_url

    FROM career_qualifications cq

    JOIN qualifications q
      ON q.id=cq.qualification_id
      AND q.active=true

    JOIN programmes p
      ON p.qualification_id=q.id
      AND p.active=true

    JOIN institutions i
      ON i.id=p.institution_id
      AND i.active=true

    WHERE cq.career_id=${c.id}
      AND i.verification_status='verified'

    ORDER BY
      CASE WHEN cq.relevance='primary' THEN 0 ELSE 1 END,
      p.academic_year DESC NULLS LAST,
      i.name,
      p.name
  `;

  /*
   * Fallback for careers where exact programme data
   * has not yet been loaded.
   */
  const types=[] as string[];

  if(
    (c.pathways||[]).some(
      (p:string)=>
        ['university','university_of_technology'].includes(p)
    )
  ){
    types.push('university');
  }

  if((c.pathways||[]).includes('tvet')){
    types.push('tvet');
  }

  const institutions=
    programmes.length===0 && types.length
      ? await sql`
          SELECT *
          FROM institutions
          WHERE active=true
            AND verification_status='verified'
            AND institution_type=ANY(${types})
          ORDER BY public_institution DESC,name
          LIMIT 12
        `
      : [];


  return (
    <div className="container section">

      <Link href="/careers" className="muted">
        ← All careers
      </Link>

      <div
        className="pagehead"
        style={{marginTop:18}}
      >
        <div>
          <span className="pill">{c.category}</span>

          <h1 style={{marginTop:10}}>
            {c.title}
          </h1>

          <p
            className="muted"
            style={{
              fontSize:18,
              maxWidth:760,
              lineHeight:1.6
            }}
          >
            {c.summary}
          </p>
        </div>

        {u
          ? <SaveCareerButton careerId={c.id}/>
          : (
            <Link
              className="btn btn-primary"
              href="/register"
            >
              Start my LifePath
            </Link>
          )
        }
      </div>

      <div className="grid grid-2">

        <div className="card">
          <h3>What you would do</h3>

          <p
            className="muted"
            style={{lineHeight:1.7}}
          >
            {c.what_you_do}
          </p>

          <h3 style={{marginTop:22}}>
            Routes into this career
          </h3>

          <div style={{marginTop:12}}>
            <PathwayTags items={c.pathways}/>
          </div>

          <p
            className="muted"
            style={{
              fontSize:13,
              lineHeight:1.55,
              marginTop:15
            }}
          >
            Routes vary by employer, qualification and
            regulatory requirements. LifePath shows
            alternatives so university is never assumed
            to be the only route.
          </p>
        </div>

        <div className="card">

          <h3>School subject guidance</h3>

          {Object.keys(c.subject_guidance||{}).length
            ? (
              <div
                className="timeline"
                style={{marginTop:15}}
              >
                {Object.entries(c.subject_guidance)
                  .map(([subject,importance])=>(
                    <div
                      className="timeline-item"
                      key={subject}
                    >
                      <span className="dot">
                        {marks[subject]!=null
                          ? Math.round(marks[subject])
                          : '•'}
                      </span>

                      <div>
                        <b>{subject}</b>

                        <div
                          className="muted"
                          style={{fontSize:13}}
                        >
                          {String(importance)}

                          {marks[subject]!=null
                            ? ` · your latest mark: ${marks[subject]}%`
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )
            : (
              <p className="muted">
                No single school subject defines this route.
                Specific programmes may have their own entry
                requirements.
              </p>
            )
          }

          <div
            className="notice"
            style={{marginTop:18}}
          >
            Always compare the exact requirements of the
            qualification and institution you plan to
            apply to.
          </div>
        </div>
      </div>

      {programmes.length>0 && (
        <div style={{marginTop:28}}>

          <div className="section-head">
            <div>
              <div className="eyebrow">
                Verified pathway
              </div>

              <h2>
                Programmes connected to this career
              </h2>

              <p className="muted">
                These programme records are connected to
                this career through a verified qualification
                record. Always confirm the latest information
                on the official programme page before applying.
              </p>
            </div>
          </div>

          <div className="grid grid-2">

            {programmes.map((p:any)=>{
              const req=p.requirements||{};

              return (
                <div
                  className="card"
                  key={p.id}
                >
                  <div
                    style={{
                      display:'flex',
                      justifyContent:'space-between',
                      gap:8,
                      flexWrap:'wrap'
                    }}
                  >
                    <span className="pill good">
                      ✓ Verified institution
                    </span>

                    <span className="pill">
                      {p.academic_year || 'Current'}
                    </span>
                  </div>

                  <h3 style={{marginTop:14}}>
                    {p.qualification_title}
                  </h3>

                  <p
                    className="muted"
                    style={{
                      fontWeight:700,
                      marginBottom:4
                    }}
                  >
                    {p.institution_name}
                  </p>

                  <p
                    className="muted"
                    style={{fontSize:13}}
                  >
                    {p.name}

                    {p.nqf_level
                      ? ` · NQF ${p.nqf_level}`
                      : ''}

                    {p.saqa_id
                      ? ` · SAQA ${p.saqa_id}`
                      : ''}
                  </p>

                  {(req.aps ||
                    req.english ||
                    req.mathematics ||
                    req.physical_sciences) && (
                    <div style={{marginTop:18}}>

                      <h4>
                        Published minimum requirements
                      </h4>

                      {req.aps && (
                        <div
                          className="notice"
                          style={{margin:'10px 0 14px'}}
                        >
                          <b>APS:</b> {req.aps}
                        </div>
                      )}

                      <div className="timeline">

                        {programmeSubjectRequirements(req).map(
                          ({key,requirement}:any)=>(
                            <RequirementRow
                              key={key}
                              label={requirementLabel(
                                key,
                                requirement
                              )}
                              requirement={requirement}
                              mark={learnerMark(
                                marks,
                                requirementMarkNames(
                                  key,
                                  requirement
                                )
                              )}
                            />
                          )
                        )}

                      </div>
                    </div>
                  )}

                  {req.note && (
                    <p
                      className="muted"
                      style={{
                        fontSize:12,
                        lineHeight:1.55,
                        marginTop:14
                      }}
                    >
                      {req.note}
                    </p>
                  )}

                  <div
                    style={{
                      display:'flex',
                      gap:8,
                      flexWrap:'wrap',
                      marginTop:18
                    }}
                  >
                    {p.programme_url && (
                      <a
                        className="btn btn-primary"
                        href={p.programme_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official programme ↗
                      </a>
                    )}

                    {p.qualification_source_url && (
                      <a
                        className="btn btn-ghost"
                        href={p.qualification_source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Verify qualification ↗
                      </a>
                    )}

                    {p.application_url && (
                      <a
                        className="btn btn-ghost"
                        href={p.application_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Apply ↗
                      </a>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {programmes.length===0 &&
       institutions.length>0 && (
        <div style={{marginTop:28}}>

          <div className="section-head">
            <div>
              <h2>
                Verified institutions to research
              </h2>

              <p className="muted">
                LifePath has not yet connected a verified
                programme record to this career. These
                institutions are verified, but this does
                not mean they offer this exact programme.
                Confirm the programme on the institution's
                official website.
              </p>
            </div>
          </div>

          <div className="grid grid-3">

            {institutions.map((i:any)=>(
              <div
                className="card"
                key={i.id}
              >
                <span className="pill good">
                  ✓ Verified
                </span>

                <h3 style={{marginTop:10}}>
                  {i.name}
                </h3>

                <p className="muted">
                  {i.province}
                  {' · '}
                  {i.institution_type==='tvet'
                    ? 'TVET College'
                    : 'University'}
                </p>

                {i.website_url && (
                  <a
                    className="btn btn-ghost"
                    href={i.website_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Official website ↗
                  </a>
                )}
              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
}



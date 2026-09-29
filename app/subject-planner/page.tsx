import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { SubjectPlanner } from '@/components/SubjectPlanner';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { latestMarks } from '@/lib/learner';

export const metadata={
  title:'Subject Planner | LifePath'
};

function normaliseSubject(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]/g,'');
}

function learnerMark(
  marks:Record<string,number>,
  subject:string
){
  const wanted=normaliseSubject(subject);

  for(const [name,mark] of Object.entries(marks)){
    if(normaliseSubject(name)===wanted) return mark;
  }

  return null;
}

function numericRequirement(value:any):number|null{
  if(typeof value==='number' && Number.isFinite(value)){
    return value;
  }

  if(typeof value==='string'){
    const match=value.match(/(\d{1,3})\s*%?/);

    if(match){
      const number=Number(match[1]);

      if(Number.isFinite(number)) return number;
    }
  }

  if(
    value &&
    typeof value==='object' &&
    !Array.isArray(value)
  ){
    for(const key of [
      'minimum',
      'min',
      'percentage',
      'percent',
      'mark'
    ]){
      const result:number|null=numericRequirement(value[key]);

      if(result!=null) return result;
    }
  }

  return null;
}

function achievementPercent(level:any):number|null{
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

function exactSubjectRequirements(requirements:any){
  if(!requirements || typeof requirements!=='object'){
    return [];
  }

  const source=
    requirements.subjects &&
    typeof requirements.subjects==='object' &&
    !Array.isArray(requirements.subjects)
      ? requirements.subjects
      : requirements;

  const metadataKeys=new Set([
    'aps',
    'note',
    'curriculum',
    'subjects'
  ]);

  return Object.entries(source)
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
    .map(([key,value])=>{
      const requirement=value as any;

      const explicitMinimum=numericRequirement(
        requirement.minimum_percent
      );

      const levelMinimum=achievementPercent(
        requirement.achievement_level
      );

      const required=
        explicitMinimum!=null
          ? explicitMinimum
          : levelMinimum;

      return {
        subject:
          typeof requirement.subject==='string' &&
          requirement.subject.trim()
            ? requirement.subject
            : key,
        required,
        published:requirement
      };
    })
    .filter(item=>item.required!=null);
}
function publishedText(value:any){
  if(typeof value==='string' || typeof value==='number'){
    return String(value);
  }

  if(value && typeof value==='object'){
    return Object.entries(value)
      .map(([key,val])=>`${key}: ${String(val)}`)
      .join(' · ');
  }

  return 'See official programme';
}

export default async function Page(){
  const sql=db();
  const user=await currentUser().catch(()=>null);

  const [careers,marks,saved]=await Promise.all([
    sql`
      SELECT
        slug,
        title,
        category,
        summary,
        subject_guidance
      FROM careers
      WHERE active=true
      ORDER BY title
    `,
    user
      ? latestMarks(user.id)
      : Promise.resolve({} as Record<string,number>),
    user
      ? sql`
          SELECT
            c.id,
            c.slug,
            c.title,
            c.category,
            c.summary,
            c.pathways,
            c.subject_guidance
          FROM saved_careers sc
          JOIN careers c
            ON c.id=sc.career_id
            AND c.active=true
          WHERE sc.user_id=${user.id}
          ORDER BY c.title
        `
      : Promise.resolve([])
  ]);

  const savedIds=saved.map((career:any)=>career.id);

  const programmes=savedIds.length
    ? await sql`
        SELECT
          c.id AS career_id,
          c.slug AS career_slug,
          c.title AS career_title,

          cq.relevance,

          q.title AS qualification_title,
          q.qualification_type,
          q.nqf_level,
          q.saqa_id,

          p.id AS programme_id,
          p.name AS programme_name,
          p.academic_year,
          p.requirements,
          p.programme_url,
          p.application_url,
          p.source_url,
          p.verified_at,

          i.name AS institution_name,
          i.slug AS institution_slug,
          i.verification_status

        FROM career_qualifications cq

        JOIN careers c
          ON c.id=cq.career_id
          AND c.active=true

        JOIN qualifications q
          ON q.id=cq.qualification_id
          AND q.active=true

        JOIN programmes p
          ON p.qualification_id=q.id
          AND p.active=true

        JOIN institutions i
          ON i.id=p.institution_id
          AND i.active=true
          AND i.verification_status='verified'

        WHERE c.id = ANY(${savedIds}::uuid[])

        ORDER BY
          c.title,
          CASE
            WHEN cq.relevance='primary' THEN 0
            ELSE 1
          END,
          p.academic_year DESC NULLS LAST,
          i.name,
          p.name
      `
    : [];

  const pathwayChecks=saved.map((career:any)=>{
    const careerProgrammes=programmes
      .filter((programme:any)=>
        programme.career_id===career.id
      )
      .map((programme:any)=>{
        const requirements=exactSubjectRequirements(
          programme.requirements
        );

        const subjectChecks=requirements.map(item=>{
          const current=learnerMark(marks,item.subject);
          const required=Number(item.required);

          if(current==null){
            return {
              subject:item.subject,
              current:null,
              required,
              published:publishedText(item.published),
              status:'missing'
            };
          }

          return {
            subject:item.subject,
            current,
            required,
            published:publishedText(item.published),
            status:current>=required
              ? 'on-track'
              : 'attention',
            gap:Math.max(0,required-current)
          };
        });

        return {
          ...programme,
          subjectChecks,
          exactRequirementCount:subjectChecks.length,
          onTrack:subjectChecks.filter(
            (item:any)=>item.status==='on-track'
          ).length,
          attention:subjectChecks.filter(
            (item:any)=>item.status==='attention'
          ).length,
          missing:subjectChecks.filter(
            (item:any)=>item.status==='missing'
          ).length
        };
      });

    return {
      ...career,
      programmes:careerProgrammes
    };
  });

  return (
    <AppShell>
      <div className="pagehead">
        <div>
          <div className="eyebrow">
            My subjects · My pathways
          </div>

          <h1>Know where you are. See what comes next.</h1>

          <p
            className="muted"
            style={{maxWidth:850,lineHeight:1.65}}
          >
            Compare your current school marks with published
            requirements for verified programmes connected to
            careers you have saved. Then use the subject decision
            tool before changing an important subject.
          </p>
        </div>

        {user && (
          <Link className="btn btn-soft" href="/onboarding">
            Update my marks
          </Link>
        )}
      </div>

      <div className="notice" style={{marginBottom:24}}>
        <b>Your marks today are not your future.</b>{' '}
        A gap shows where attention may be useful; it does not mean
        you cannot pursue a career. Requirements can also differ
        between programmes and institutions. Always confirm the
        latest information on the official programme page.
      </div>

      {!user ? (
        <div className="card" style={{marginBottom:30}}>
          <div className="eyebrow">My pathway check</div>
          <h2>Sign in to compare your subjects.</h2>
          <p className="muted">
            Your saved careers and latest marks are needed for a
            personal pathway comparison. You can still use the
            subject decision tool below without signing in.
          </p>

          <Link className="btn btn-primary" href="/login">
            Sign in →
          </Link>
        </div>
      ) : saved.length===0 ? (
        <div className="card" style={{marginBottom:30}}>
          <div className="eyebrow">My pathway check</div>
          <h2>Save a career to start comparing.</h2>
          <p className="muted">
            Explore careers and save the ones you want to
            investigate. LifePath will bring their verified
            programme requirements into this planner.
          </p>

          <Link className="btn btn-primary" href="/results">
            Explore my career matches →
          </Link>
        </div>
      ) : (
        <section style={{marginBottom:34}}>
          <div className="section-head">
            <div>
              <div className="eyebrow">My pathway check</div>
              <h2>Where am I now?</h2>
              <p className="muted">
                Comparing your latest recorded marks with exact
                subject minimums published in LifePath's verified
                programme records.
              </p>
            </div>

            <span className="pill">
              {saved.length} saved{' '}
              {saved.length===1?'career':'careers'}
            </span>
          </div>

          <div style={{display:'grid',gap:18}}>
            {pathwayChecks.map((career:any)=>(
              <div className="card" key={career.id}>
                <div
                  style={{
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'flex-start',
                    gap:14,
                    flexWrap:'wrap'
                  }}
                >
                  <div>
                    <span className="pill">
                      {career.category}
                    </span>

                    <h2 style={{margin:'10px 0 6px'}}>
                      {career.title}
                    </h2>

                    <p
                      className="muted"
                      style={{
                        margin:0,
                        maxWidth:720,
                        lineHeight:1.55
                      }}
                    >
                      {career.summary}
                    </p>
                  </div>

                  <Link
                    className="btn btn-ghost"
                    href={`/careers/${career.slug}`}
                  >
                    Career pathway →
                  </Link>
                </div>

                {career.programmes.length ? (
                  <div
                    style={{
                      display:'grid',
                      gap:14,
                      marginTop:20
                    }}
                  >
                    {career.programmes.map((programme:any)=>(
                      <div
                        key={programme.programme_id}
                        style={{
                          border:'1px solid #e5e7eb',
                          borderRadius:14,
                          padding:16
                        }}
                      >
                        <div
                          style={{
                            display:'flex',
                            justifyContent:'space-between',
                            gap:12,
                            flexWrap:'wrap'
                          }}
                        >
                          <div>
                            <b>{programme.programme_name}</b>

                            <div
                              className="muted"
                              style={{marginTop:4}}
                            >
                              {programme.institution_name}
                              {programme.academic_year
                                ? ` · ${programme.academic_year}`
                                : ''}
                            </div>

                            <div
                              className="muted"
                              style={{
                                fontSize:12,
                                marginTop:4
                              }}
                            >
                              {programme.qualification_title}
                              {' · '}
                              {programme.relevance==='primary'
                                ? 'Primary route'
                                : 'Related route'}
                            </div>
                          </div>

                          <span className="pill good">
                            ✓ Verified institution
                          </span>
                        </div>

                        {programme.exactRequirementCount ? (
                          <>
                            <div
                              className="grid grid-3"
                              style={{marginTop:16}}
                            >
                              <div
                                style={{
                                  padding:12,
                                  borderRadius:12,
                                  background:'#f8fafc'
                                }}
                              >
                                <div className="muted">
                                  On track
                                </div>
                                <b
                                  style={{
                                    fontSize:24,
                                    color:'var(--good)'
                                  }}
                                >
                                  {programme.onTrack}
                                </b>
                              </div>

                              <div
                                style={{
                                  padding:12,
                                  borderRadius:12,
                                  background:'#f8fafc'
                                }}
                              >
                                <div className="muted">
                                  Needs attention
                                </div>
                                <b
                                  style={{
                                    fontSize:24,
                                    color:'var(--warn)'
                                  }}
                                >
                                  {programme.attention}
                                </b>
                              </div>

                              <div
                                style={{
                                  padding:12,
                                  borderRadius:12,
                                  background:'#f8fafc'
                                }}
                              >
                                <div className="muted">
                                  Mark needed
                                </div>
                                <b style={{fontSize:24}}>
                                  {programme.missing}
                                </b>
                              </div>
                            </div>

                            <div
                              style={{
                                display:'grid',
                                gap:8,
                                marginTop:16
                              }}
                            >
                              {programme.subjectChecks.map(
                                (check:any)=>(
                                  <div
                                    key={check.subject}
                                    style={{
                                      display:'grid',
                                      gridTemplateColumns:
                                        'minmax(150px,1fr) repeat(3,minmax(90px,auto))',
                                      gap:12,
                                      alignItems:'center',
                                      padding:'11px 12px',
                                      border:'1px solid #edf0f5',
                                      borderRadius:10
                                    }}
                                  >
                                    <b>{check.subject}</b>

                                    <span className="muted">
                                      You:{' '}
                                      {check.current==null
                                        ? 'Not added'
                                        : `${check.current}%`}
                                    </span>

                                    <span className="muted">
                                      Published minimum:{' '}
                                      {check.required}%
                                    </span>

                                    {check.status==='on-track' ? (
                                      <span className="pill good">
                                        On track
                                      </span>
                                    ) : check.status==='attention' ? (
                                      <span className="pill warn">
                                        {check.gap} point
                                        {check.gap===1?'':'s'} to
                                        published minimum
                                      </span>
                                    ) : (
                                      <span className="pill">
                                        Add your mark
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <div
                            className="notice"
                            style={{marginTop:16}}
                          >
                            <b>
                              Exact subject minimums are not
                              available in this LifePath record.
                            </b>{' '}
                            We will not estimate them. Check the
                            official programme source for the
                            current requirements.
                          </div>
                        )}

                        <div
                          style={{
                            display:'flex',
                            gap:8,
                            flexWrap:'wrap',
                            marginTop:16
                          }}
                        >
                          {programme.programme_url && (
                            <a
                              className="btn btn-ghost"
                              href={programme.programme_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Official programme ↗
                            </a>
                          )}

                          <Link
                            className="btn btn-soft"
                            href="/onboarding"
                          >
                            Update my marks
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="notice"
                    style={{marginTop:18}}
                  >
                    <b>
                      No exact verified programme comparison is
                      available for this career yet.
                    </b>{' '}
                    This does not mean there is no route. Open the
                    career pathway to investigate university,
                    TVET, occupational, artisan, learnership,
                    apprenticeship or other relevant routes.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div
        style={{
          borderTop:'1px solid #e5e7eb',
          paddingTop:30
        }}
      >
        <div className="section-head">
          <div>
            <div className="eyebrow">
              Subject decision tool
            </div>

            <h2>Thinking of changing a subject?</h2>

            <p className="muted">
              Check which career routes deserve investigation
              before you make the change.
            </p>
          </div>
        </div>

        <SubjectPlanner careers={careers}/>
      </div>
    </AppShell>
  );
}

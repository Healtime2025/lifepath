import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  latestAssessment,
  latestMarks,
  topCareerMatches
} from '@/lib/learner';
import { ProgressBar } from '@/components/ProgressBar';

export const metadata={
  title:'Dashboard'
};

export default async function Page(){
  const u=await currentUser().catch(()=>null);

  if(!u) redirect('/login');

  const sql=db();

  const [
    assessment,
    marks,
    matches,
    apps,
    savedRows,
    events
  ]=await Promise.all([
    latestAssessment(u.id),
    latestMarks(u.id),
    topCareerMatches(u.id,3),

    sql`
      SELECT *
      FROM applications
      WHERE user_id=${u.id}
      ORDER BY updated_at DESC
      LIMIT 5
    `,

    sql`
      SELECT count(*)::int AS n
      FROM saved_careers
      WHERE user_id=${u.id}
    `,

    sql`
      SELECT *
      FROM progress_events
      WHERE user_id=${u.id}
      ORDER BY created_at DESC
      LIMIT 6
    `
  ]);

  const marksCount=Object.keys(marks).length;
  const savedCount=Number(savedRows[0]?.n||0);
  const applicationsCount=apps.length;

  const journey=[
    {
      label:'Profile',
      complete:!!u.onboarding_complete,
      href:'/onboarding'
    },
    {
      label:'Discover',
      complete:!!assessment,
      href:'/assessment'
    },
    {
      label:'Explore',
      complete:!!assessment && matches.length>0,
      href:'/results'
    },
    {
      label:'Choose',
      complete:savedCount>0,
      href:'/results'
    },
    {
      label:'Prepare',
      complete:savedCount>0 && marksCount>0,
      href:'/subject-planner'
    },
    {
      label:'Apply & track',
      complete:applicationsCount>0,
      href:'/applications'
    }
  ];

  const completed=journey.filter(step=>step.complete).length;
  const pct=Math.round(completed/journey.length*100);

  let nextTitle='';
  let nextText='';
  let nextHref='';
  let nextButton='';

  if(!u.onboarding_complete){
    nextTitle='Build your starting point';
    nextText=
      'Tell LifePath your grade, subjects and current marks. This gives the rest of your journey useful context.';
    nextHref='/onboarding';
    nextButton='Complete my profile';
  }else if(!assessment){
    nextTitle='Discover what fits you';
    nextText=
      'Complete the discovery assessment to identify careers and work environments worth exploring.';
    nextHref='/assessment';
    nextButton='Start assessment';
  }else if(marksCount===0){
    nextTitle='Add your latest marks';
    nextText=
      'Your assessment already helps with career exploration. Add your marks so LifePath can also help you investigate study requirements.';
    nextHref='/onboarding';
    nextButton='Add my marks';
  }else if(savedCount===0){
    nextTitle='Choose careers to investigate';
    nextText=
      'Explore your matches and save the careers that genuinely interest you. Saving is not a final decision.';
    nextHref='/results';
    nextButton='Explore my matches';
  }else if(applicationsCount===0){
    nextTitle='Check your pathway readiness';
    nextText=
      'You have saved a career. Now compare your current subjects and marks with verified programme requirements where LifePath has them.';
    nextHref='/subject-planner';
    nextButton='Check my subjects';
  }else{
    nextTitle='Keep your applications moving';
    nextText=
      'You have started tracking applications. Review deadlines, statuses and the next action for each opportunity.';
    nextHref='/applications';
    nextButton='View my applications';
  }

  return (
    <AppShell>
      <div className="pagehead">
        <div>
          <div className="eyebrow">My LifePath</div>

          <h1>Hello {u.first_name||'there'}.</h1>

          <p className="muted">
            Keep moving one clear step at a time.
          </p>
        </div>

        <Link
          className="btn btn-primary"
          href={nextHref}
        >
          {nextButton} →
        </Link>
      </div>

      <div
        className="card"
        style={{marginBottom:22}}
      >
        <div
          style={{
            display:'flex',
            justifyContent:'space-between',
            gap:16,
            alignItems:'center',
            flexWrap:'wrap'
          }}
        >
          <div>
            <div className="eyebrow">
              My journey
            </div>

            <h2 style={{margin:'6px 0'}}>
              {completed} of {journey.length} journey stages started
            </h2>

            <p
              className="muted"
              style={{margin:0}}
            >
              LifePath is a guide, not a race. You can revisit any
              stage as your interests, marks and plans change.
            </p>
          </div>

          <b
            style={{
              fontSize:28,
              color:'var(--brand)'
            }}
          >
            {pct}%
          </b>
        </div>

        <div style={{marginTop:14}}>
          <ProgressBar value={pct}/>
        </div>

        <div
          style={{
            display:'flex',
            gap:8,
            flexWrap:'wrap',
            marginTop:16
          }}
        >
          {journey.map((step,index)=>(
            <Link
              key={step.label}
              href={step.href}
              className={step.complete?'pill good':'pill'}
              style={{textDecoration:'none'}}
            >
              {step.complete?'✓ ':`${index+1}. `}
              {step.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        className="kpis"
        style={{marginBottom:22}}
      >
        <div className="card kpi">
          <span className="muted">Subjects tracked</span>
          <b>{marksCount}</b>
        </div>

        <div className="card kpi">
          <span className="muted">Saved careers</span>
          <b>{savedCount}</b>
        </div>

        <div className="card kpi">
          <span className="muted">Applications tracked</span>
          <b>{applicationsCount}</b>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="eyebrow">
            Your next step
          </div>

          <h2 style={{marginTop:6}}>
            {nextTitle}
          </h2>

          <p
            className="muted"
            style={{lineHeight:1.65}}
          >
            {nextText}
          </p>

          <div
            style={{
              display:'flex',
              gap:8,
              flexWrap:'wrap',
              marginTop:16
            }}
          >
            <Link
              className="btn btn-primary"
              href={nextHref}
            >
              {nextButton} →
            </Link>

            {savedCount>0 && (
              <Link
                className="btn btn-ghost"
                href="/subject-planner"
              >
                Subject planner
              </Link>
            )}

            {assessment && (
              <Link
                className="btn btn-ghost"
                href="/results"
              >
                My matches
              </Link>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Recent progress</h3>

          <div
            className="timeline"
            style={{marginTop:16}}
          >
            {events.length
              ? events.map((event:any)=>(
                  <div
                    className="timeline-item"
                    key={event.id}
                  >
                    <span className="dot">✓</span>

                    <div>
                      <b>{event.title}</b>

                      <div
                        className="muted"
                        style={{
                          fontSize:12,
                          marginTop:3
                        }}
                      >
                        {new Date(
                          event.created_at
                        ).toLocaleDateString('en-ZA')}
                      </div>
                    </div>
                  </div>
                ))
              : (
                  <div className="empty">
                    Your journey will appear here as you progress.
                  </div>
                )
            }
          </div>
        </div>
      </div>

      {savedCount>0 && (
        <div
          className="card"
          style={{marginTop:22}}
        >
          <div className="eyebrow">
            From career idea to action
          </div>

          <h2 style={{marginTop:6}}>
            Your saved careers now have somewhere to go.
          </h2>

          <p
            className="muted"
            style={{
              maxWidth:800,
              lineHeight:1.65
            }}
          >
            Check your subjects, investigate verified programmes,
            follow the institution's official application process
            and then use LifePath to keep track of what you have
            applied for.
          </p>

          <div
            style={{
              display:'flex',
              gap:8,
              flexWrap:'wrap',
              marginTop:16
            }}
          >
            <Link
              className="btn btn-primary"
              href="/subject-planner"
            >
              Check pathway readiness →
            </Link>

            <Link
              className="btn btn-ghost"
              href="/programmes"
            >
              Explore programmes
            </Link>

            <Link
              className="btn btn-ghost"
              href="/applications"
            >
              Track an application
            </Link>
          </div>
        </div>
      )}

      {matches.length>0 && (
        <div style={{marginTop:22}}>
          <div className="section-head">
            <div>
              <div className="eyebrow">
                Keep exploring
              </div>

              <h2>Careers worth investigating</h2>

              <p className="muted">
                Match percentages describe current exploration
                alignment. They are not predictions of success
                and they do not choose a career for you.
              </p>
            </div>

            <Link
              href="/results"
              style={{
                color:'var(--brand)',
                fontWeight:800
              }}
            >
              See all matches →
            </Link>
          </div>

          <div className="grid grid-3">
            {matches.map((career:any)=>(
              <Link
                href={`/careers/${career.slug}`}
                className="card"
                key={career.id}
              >
                <span className="pill">
                  {career.category}
                </span>

                <h3 style={{marginTop:10}}>
                  {career.title}
                </h3>

                <p className="muted">
                  {career.summary}
                </p>

                <b style={{color:'var(--brand)'}}>
                  {career.match}% exploration alignment
                </b>

                <div
                  className="muted"
                  style={{
                    fontSize:12,
                    marginTop:6
                  }}
                >
                  Open the career to understand why it may be
                  worth exploring.
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  latestAssessment,
  latestMarks,
  topCareerMatches
} from '@/lib/learner';
import { dimensions } from '@/lib/assessment';
import { ResultsCareerFamilies } from '@/components/ResultsCareerFamilies';

export const metadata={
  title:'My career matches | LifePath'
};

export default async function Page(){
  const u=await currentUser().catch(()=>null);

  if(!u) redirect('/login');

  const [a,marks,matches]=await Promise.all([
    latestAssessment(u.id),
    latestMarks(u.id),
    topCareerMatches(u.id)
  ]);

  if(!a) redirect('/assessment');

  const strongest=matches.slice(0,3);
  const marksAvailable=Object.keys(marks).length>0;

  return (
    <AppShell>
      <div className="pagehead">
        <div>
          <div className="eyebrow">Your LifePath</div>

          <h1>Careers worth exploring.</h1>

          <p
            className="muted"
            style={{
              maxWidth:760,
              fontSize:17,
              lineHeight:1.65
            }}
          >
            These matches are starting points, not decisions.
            LifePath uses your assessment as the main signal and
            your school subjects only as supporting information.
            Explore the careers that interest you and see how you
            could get there.
          </p>
        </div>

        <div
          style={{
            display:'flex',
            gap:10,
            flexWrap:'wrap'
          }}
        >
          <Link
            className="btn btn-soft"
            href="/assessment"
          >
            Retake assessment
          </Link>

          <Link
            className="btn btn-ghost"
            href="/careers"
          >
            Explore all careers
          </Link>
        </div>
      </div>

      {strongest.length>0 && (
        <div
          className="card"
          style={{
            marginBottom:24,
            padding:24
          }}
        >
          <div className="eyebrow">
            Start here
          </div>

          <h2 style={{marginTop:6}}>
            Your strongest current possibilities
          </h2>

          <p
            className="muted"
            style={{
              maxWidth:760,
              lineHeight:1.6
            }}
          >
            You do not have to choose one now. Open a career,
            understand the work, check the subjects and explore
            the verified routes available to you.
          </p>

          <div
            style={{
              display:'flex',
              gap:8,
              flexWrap:'wrap',
              marginTop:16
            }}
          >
            {strongest.map((career:any)=>(
              <Link
                key={career.id}
                className="btn btn-primary"
                href={`/careers/${career.slug}`}
              >
                Explore {career.title} â†’
              </Link>
            ))}
          </div>
        </div>
      )}

      <div
        className="section-head"
        style={{marginTop:8}}
      >
        <div>
          <div className="eyebrow">
            Your profile
          </div>

          <h2>What your assessment is showing</h2>

          <p className="muted">
            These dimensions help explain why different kinds
            of work appear in your results.
          </p>
        </div>
      </div>

      <div
        className="grid grid-3"
        style={{marginBottom:28}}
      >
        {dimensions.map(([k,label,desc])=>(
          <div className="card" key={k}>
            <div
              style={{
                display:'flex',
                justifyContent:'space-between',
                gap:10
              }}
            >
              <h3>{label}</h3>

              <b style={{color:'var(--brand)'}}>
                {Number(a.scores[k]||0)}%
              </b>
            </div>

            <div
              className="progress"
              style={{margin:'12px 0'}}
            >
              <span
                style={{
                  width:`${Number(a.scores[k]||0)}%`
                }}
              />
            </div>

            <p
              className="muted"
              style={{
                fontSize:13,
                lineHeight:1.55
              }}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>

      {!marksAvailable && (
        <div
          className="notice"
          style={{marginBottom:24}}
        >
          <b>Add your school marks.</b>{' '}
          Your assessment already drives your career matches.
          Adding subjects and marks allows LifePath to also show
          whether particular study routes may fit your current
          academic position.{' '}

          <Link
            href="/onboarding"
            style={{fontWeight:800}}
          >
            Add marks â†’
          </Link>
        </div>
      )}

      <div className="section-head">
        <div>
          <div className="eyebrow">
            Explore your possibilities
          </div>

          <h2>Your career families</h2>

          <p
            className="muted"
            style={{
              maxWidth:760,
              lineHeight:1.6
            }}
          >
            Careers are grouped into families so you can explore
            broadly before narrowing your choices. Open any career
            to see what the work involves and how to get there.
          </p>
        </div>
      </div>

      <ResultsCareerFamilies matches={matches}/>

      <div
        className="notice"
        style={{marginTop:24}}
      >
        <b>Remember:</b> a match is not a prediction of success
        and it does not choose a career for you. Interests can
        develop, subjects can improve and many careers have more
        than one route.
      </div>
    </AppShell>
  );
}

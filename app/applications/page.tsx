import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ApplicationsBoard } from '@/components/ApplicationsBoard';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export const metadata={
  title:'Applications'
};

export default async function Page({
  searchParams
}:{
  searchParams:Promise<{
    programmeId?:string;
    institutionId?:string;
    title?:string;
    applicationType?:string;
    externalUrl?:string;
  }>
}){
  const sp=await searchParams;
  const u=await currentUser().catch(()=>null);

  if(!u) redirect('/login');

  const sql=db();

  const rows=await sql`
    SELECT *
    FROM applications
    WHERE user_id=${u.id}
    ORDER BY deadline NULLS LAST,updated_at DESC
  `;

  return (
    <AppShell>
      <div className="pagehead">
        <div>
          <div className="eyebrow">
            Apply & track
          </div>

          <h1>Keep every application moving.</h1>

          <p
            className="muted"
            style={{
              maxWidth:780,
              lineHeight:1.65
            }}
          >
            Study, funding, learnership and apprenticeship
            applications can all be tracked in one place.
            Applications themselves happen through the official
            institution, employer or funding provider.
          </p>
        </div>

        <Link
          className="btn btn-ghost"
          href="/dashboard"
        >
          My LifePath
        </Link>
      </div>

      <div
        className="notice"
        style={{marginBottom:22}}
      >
        <b>LifePath does not submit applications for you.</b>{' '}
        Use the official application link provided by the
        institution or provider. Then record the application here
        so you can remember deadlines, status and next actions.
      </div>

      <div
        className="card"
        style={{marginBottom:22}}
      >
        <div className="eyebrow">
          Before you apply
        </div>

        <h2 style={{marginTop:6}}>
          Check the route first.
        </h2>

        <p
          className="muted"
          style={{
            maxWidth:760,
            lineHeight:1.65
          }}
        >
          If you are still deciding, return to your saved career,
          compare your subjects with verified programme
          requirements where available, and confirm the latest
          details on the official programme page.
        </p>

        <div
          style={{
            display:'flex',
            gap:8,
            flexWrap:'wrap',
            marginTop:14
          }}
        >
          <Link
            className="btn btn-primary"
            href="/subject-planner"
          >
            Check my subjects
          </Link>

          <Link
            className="btn btn-ghost"
            href="/programmes"
          >
            Explore programmes
          </Link>

          <Link
            className="btn btn-ghost"
            href="/results"
          >
            My career matches
          </Link>
        </div>
      </div>

      {rows.length>0 && (
        <div
          className="notice"
          style={{marginBottom:22}}
        >
          You are tracking <b>{rows.length}</b>{' '}
          {rows.length===1?'application':'applications'}.
          Keep the status and next action updated after checking
          the official provider.
        </div>
      )}

      <ApplicationsBoard
        initial={rows}
        prefill={{
          programmeId:sp.programmeId || '',
          institutionId:sp.institutionId || '',
          title:sp.title || '',
          applicationType:sp.applicationType || 'study',
          externalUrl:sp.externalUrl || ''
        }}
      />

      <div
        className="card"
        style={{marginTop:22}}
      >
        <div className="eyebrow">
          Continue my journey
        </div>

        <h3 style={{marginTop:6}}>
          Finished updating applications?
        </h3>

        <p className="muted">
          Return to your dashboard to see the next step in your
          LifePath.
        </p>

        <Link
          className="btn btn-primary"
          href="/dashboard"
        >
          Back to My LifePath →
        </Link>
      </div>
    </AppShell>
  );
}

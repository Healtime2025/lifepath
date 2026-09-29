import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { bad,cleanText,cleanUrl,ok } from '@/lib/http';

const allowedTypes=new Set([
  'study','funding','learnership','apprenticeship','employment','other'
]);

const allowedStatuses=new Set([
  'planned','started','submitted','awaiting',
  'offered','accepted','declined','closed'
]);

function cleanUuid(value:any){
  const v=cleanText(value,60);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
    ? v
    : null;
}

export async function POST(req:Request){
  try{
    const u=await requireUser();
    const b=await req.json();

    const title=cleanText(b.title,200);
    const type=cleanText(b.applicationType,30);
    const deadline=cleanText(b.deadline,20)||null;
    const url=cleanUrl(b.externalUrl)||null;
    const notes=cleanText(b.notes,2000)||null;
    const programmeId=cleanUuid(b.programmeId);
    const institutionId=cleanUuid(b.institutionId);

    if(!title || !allowedTypes.has(type)){
      return bad('Title and valid application type are required.');
    }

    const sql=db();
    let verifiedProgrammeId:string|null=null;
    let verifiedInstitutionId:string|null=null;

    if(programmeId){
      const verified=await sql`
        SELECT p.id,p.institution_id
        FROM programmes p
        JOIN institutions i ON i.id=p.institution_id
        WHERE p.id=${programmeId}::uuid
          AND p.active=true
          AND i.active=true
          AND i.verification_status='verified'
        LIMIT 1
      `;

      if(verified.length){
        verifiedProgrammeId=verified[0].id;
        verifiedInstitutionId=verified[0].institution_id;
      }
    }

    if(!verifiedProgrammeId && institutionId){
      const institution=await sql`
        SELECT id
        FROM institutions
        WHERE id=${institutionId}::uuid
          AND active=true
          AND verification_status='verified'
        LIMIT 1
      `;

      if(institution.length){
        verifiedInstitutionId=institution[0].id;
      }
    }

    const rows=await sql`
      INSERT INTO applications(
        user_id,institution_id,programme_id,title,
        application_type,external_url,deadline,notes
      )
      VALUES(
        ${u.id},${verifiedInstitutionId},${verifiedProgrammeId},
        ${title},${type},${url},${deadline},${notes}
      )
      RETURNING *
    `;

    await sql`
      INSERT INTO progress_events(user_id,event_type,title,metadata)
      VALUES(
        ${u.id},
        'application_added',
        'Application added',
        ${JSON.stringify({
          title,
          type,
          programmeId:verifiedProgrammeId,
          institutionId:verifiedInstitutionId
        })}::jsonb
      )
    `;

    return ok({application:rows[0]});
  }catch(e:any){
    return bad(
      e.message==='UNAUTHENTICATED'
        ? 'Sign in required.'
        : 'Could not save application.',
      e.message==='UNAUTHENTICATED'?401:500
    );
  }
}

export async function PATCH(req:Request){
  try{
    const u=await requireUser();
    const b=await req.json();
    const id=cleanText(b.id,60);
    const status=cleanText(b.status,30);

    if(!id || !allowedStatuses.has(status)){
      return bad('Invalid update.');
    }

    const sql=db();

    const rows=await sql`
      UPDATE applications
      SET status=${status},updated_at=now()
      WHERE id=${id}::uuid AND user_id=${u.id}
      RETURNING *
    `;

    if(!rows.length) return bad('Application not found.',404);
    return ok({application:rows[0]});
  }catch{
    return bad('Could not update application.',500);
  }
}

export async function DELETE(req:Request){
  try{
    const u=await requireUser();
    const id=(new URL(req.url).searchParams.get('id')||'').slice(0,60);
    const sql=db();

    await sql`
      DELETE FROM applications
      WHERE id=${id}::uuid AND user_id=${u.id}
    `;

    return ok({ok:true});
  }catch{
    return bad('Could not remove application.',500);
  }
}

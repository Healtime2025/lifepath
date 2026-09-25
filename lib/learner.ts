import { db } from './db';
import {
  careerMatch,
  academicSignal,
  matchReasons
} from './matching';

export async function latestAssessment(userId: string) {
  const sql = db();

  const rows = await sql`
    SELECT *
    FROM assessment_results
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function latestMarks(userId: string) {
  const sql = db();

  const rows = await sql`
    SELECT DISTINCT ON(subject)
      subject,
      mark,
      grade,
      period,
      recorded_at
    FROM learner_marks
    WHERE user_id = ${userId}
    ORDER BY subject, recorded_at DESC
  `;

  return Object.fromEntries(
    rows.map((row: any) => [
      row.subject,
      Number(row.mark)
    ])
  );
}

export async function topCareerMatches(
  userId: string,
  limit?: number
) {
  const assessment = await latestAssessment(userId);

  if (!assessment) {
    return [];
  }

  const marks = await latestMarks(userId);
  const sql = db();

  const careers = await sql`
    SELECT
      id,
      slug,
      title,
      category,
      summary,
      pathways,
      traits,
      subject_guidance,
      future_outlook
    FROM careers
    WHERE active = true
  `;

  const matches = careers
    .map((career: any) => {
      /*
       * PRIMARY SIGNAL
       * ----------------
       * The assessment describes the kinds of work
       * the learner currently enjoys or prefers.
       */
      const profileMatch = careerMatch(
        career.traits,
        assessment.scores
      );

      /*
       * SUPPORTING SIGNAL
       * -----------------
       * Subjects and marks help show whether a route
       * is academically relevant/open.
       *
       * They must not decide what career the learner
       * should pursue.
       */
      const subjectSignal = academicSignal(
        career.subject_guidance,
        marks
      );

      /*
       * Keep interests dominant.
       *
       * A subject signal can refine close matches,
       * but cannot overpower the learner's profile.
       */
      const match =
        subjectSignal == null
          ? profileMatch
          : Math.round(
              profileMatch * 0.90 +
              subjectSignal * 0.10
            );

      return {
        ...career,
        match,
        profileMatch,
        subjectSignal,
        reasons: matchReasons(career, marks, assessment.scores)
      };
    })
    .sort((a: any, b: any) => {
      /*
       * First rank by combined exploration signal.
       * Use pure profile alignment as the tie-breaker.
       */
      return (
        Number(b.match) - Number(a.match) ||
        Number(b.profileMatch) - Number(a.profileMatch)
      );
    });

  /*
   * If a caller explicitly asks for a limit, honour it.
   * Otherwise return the complete catalogue so career
   * families are not distorted by an early top-N cut.
   */
  return typeof limit === 'number'
    ? matches.slice(0, limit)
    : matches;
}


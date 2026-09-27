import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { db } from "../lib/db";

const sql = db();

async function main() {
  console.log("");
  console.log("====================================================");
  console.log(" LP3.4ZA - INDEPENDENT LIVE NEON AUDIT");
  console.log(" READ ONLY");
  console.log("====================================================");

  // ----------------------------------------------------------
  // Global counts
  // ----------------------------------------------------------

  const careerCount:any[] = await sql`
    SELECT COUNT(*)::int AS count
    FROM careers
    WHERE active = true
  `;

  const qualificationCount:any[] = await sql`
    SELECT COUNT(*)::int AS count
    FROM qualifications
    WHERE active = true
  `;

  const programmeCount:any[] = await sql`
    SELECT COUNT(*)::int AS count
    FROM programmes
    WHERE active = true
  `;

  const linkedCount:any[] = await sql`
    SELECT COUNT(DISTINCT c.id)::int AS count
    FROM careers c
    JOIN career_qualifications cq
      ON cq.career_id = c.id
    JOIN programmes p
      ON p.qualification_id = cq.qualification_id
     AND p.active = true
    WHERE c.active = true
  `;

  console.log("");
  console.log("--- GLOBAL COUNTS ---");
  console.table({
    active_careers: careerCount[0].count,
    active_qualifications: qualificationCount[0].count,
    active_programmes: programmeCount[0].count,
    programme_linked_careers: linkedCount[0].count
  });

  if (careerCount[0].count !== 88)
    throw new Error(`ACTIVE CAREERS ${careerCount[0].count}/88`);

  if (linkedCount[0].count !== 27)
    throw new Error(`PROGRAMME LINKED ${linkedCount[0].count}/27`);

  // ----------------------------------------------------------
  // Exact four
  // ----------------------------------------------------------

  const four:any[] = await sql`
    SELECT
      c.slug AS career,
      q.saqa_id,
      q.title AS qualification,
      q.nqf_level,
      q.credits,
      cq.relevance,
      i.name AS provider,
      p.name AS programme,
      p.academic_year
    FROM careers c
    JOIN career_qualifications cq
      ON cq.career_id = c.id
    JOIN qualifications q
      ON q.id = cq.qualification_id
    JOIN programmes p
      ON p.qualification_id = q.id
     AND p.active = true
    JOIN institutions i
      ON i.id = p.institution_id
    WHERE c.slug IN (
      'graphic-designer',
      'paramedic',
      'photographer',
      'videographer'
    )
    ORDER BY c.slug, p.name
  `;

  console.log("");
  console.log("--- NEW FOUR LIVE ROUTES ---");
  console.table(four);

  const expected = new Map([
    ["graphic-designer", ["110863", "primary"]],
    ["paramedic", ["91791", "primary"]],
    ["photographer", ["100992", "primary"]],
    ["videographer", ["100992", "related"]]
  ]);

  for (const [slug,[saqa,relevance]] of expected) {
    const matches = four.filter(
      r =>
        r.career === slug &&
        String(r.saqa_id) === saqa &&
        r.relevance === relevance
    );

    if (matches.length !== 1)
      throw new Error(
        `${slug}: expected exactly one ${saqa}/${relevance} live route, found ${matches.length}`
      );
  }

  // ----------------------------------------------------------
  // Shared SAQA 100992 identity
  // ----------------------------------------------------------

  const shared:any[] = await sql`
    SELECT
      saqa_id,
      title,
      qualification_type,
      COUNT(*) OVER (
        PARTITION BY saqa_id
      )::int AS rows_for_saqa
    FROM qualifications
    WHERE saqa_id = '100992'
  `;

  console.log("");
  console.log("--- SHARED SAQA 100992 ---");
  console.table(shared);

  if (shared.length !== 1)
    throw new Error(
      `SAQA 100992 DUPLICATION: ${shared.length} qualification rows`
    );

  // ----------------------------------------------------------
  // Protect original two + LP3.3 seventeen
  // ----------------------------------------------------------

  const protectedSlugs = [
    "civil-engineer",
    "professional-nurse",
    "dental-assistant",
    "electrical-engineer",
    "horticulture-technician",
    "hotel-supervisor",
    "industrial-engineer",
    "lawyer",
    "library-assistant",
    "logistics-coordinator",
    "mechanical-engineer",
    "mechatronics-engineer",
    "occupational-therapist",
    "pharmacist",
    "physiotherapist",
    "radiographer",
    "social-worker",
    "teacher",
    "ux-designer"
  ];

  const protectedRows:any[] = await sql`
    SELECT DISTINCT c.slug
    FROM careers c
    JOIN career_qualifications cq
      ON cq.career_id = c.id
    JOIN programmes p
      ON p.qualification_id = cq.qualification_id
     AND p.active = true
    WHERE c.slug = ANY(${protectedSlugs})
    ORDER BY c.slug
  `;

  console.log("");
  console.log("--- PROTECTED ROUTES ---");
  console.table(protectedRows);

  const protectedActual = new Set(
    protectedRows.map(r => r.slug)
  );

  const missingProtected = protectedSlugs.filter(
    slug => !protectedActual.has(slug)
  );

  if (missingProtected.length)
    throw new Error(
      `PROTECTED ROUTES MISSING: ${missingProtected.join(", ")}`
    );

  // ----------------------------------------------------------
  // Duplicate programme identities
  // ----------------------------------------------------------

  const duplicates:any[] = await sql`
    SELECT
      institution_id,
      name,
      academic_year,
      COUNT(*)::int AS copies
    FROM programmes
    GROUP BY
      institution_id,
      name,
      academic_year
    HAVING COUNT(*) > 1
    ORDER BY copies DESC, name
  `;

  console.log("");
  console.log("--- DUPLICATE PROGRAMMES ---");
  console.table(duplicates);

  if (duplicates.length)
    throw new Error(
      `DUPLICATE PROGRAMMES FOUND: ${duplicates.length}`
    );

  console.log("");
  console.log("====================================================");
  console.log(" 🔥 LP3.4ZA INDEPENDENT NEON AUDIT PASS");
  console.log("====================================================");
  console.log("Active careers            : 88/88");
  console.log("Programme-linked careers  : 27");
  console.log("New four                  : 4/4");
  console.log("Shared SAQA 100992        : 1 qualification row");
  console.log("Protected routes          : 19/19");
  console.log("Duplicate programmes      : 0");
  console.log("Database writes           : 0");
}

main().catch(error => {
  console.error("");
  console.error("LP3.4ZA AUDIT FAILED");
  console.error(error);
  process.exit(1);
});

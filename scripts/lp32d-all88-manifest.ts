import { loadEnvConfig } from '@next/env';
import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'node:fs';

loadEnvConfig(process.cwd());

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL not found');
}

const sql = neon(connectionString);

async function main() {

  console.log('\n===== BUILDING ALL-88 MASTER MANIFEST =====\n');

  const careers = await sql`
    SELECT
      c.id,
      c.slug,
      c.title,
      c.category,
      c.pathways,

      COUNT(DISTINCT cq.qualification_id)::int
        AS qualification_links,

      COUNT(
        DISTINCT CASE
          WHEN i.verification_status = 'verified'
          THEN p.id
        END
      )::int AS verified_programmes

    FROM careers c

    LEFT JOIN career_qualifications cq
      ON cq.career_id = c.id

    LEFT JOIN programmes p
      ON p.qualification_id = cq.qualification_id

    LEFT JOIN institutions i
      ON i.id = p.institution_id

    WHERE c.active = true

    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.category,
      c.pathways

    ORDER BY
      c.category,
      c.title
  `;

  const manifest = careers.map((career:any, index:number) => {

    const alreadyVerified =
      Number(career.verified_programmes) > 0;

    return {
      number: index + 1,

      career_slug: career.slug,
      career_title: career.title,
      category: career.category,

      expected_pathways:
        Array.isArray(career.pathways)
          ? career.pathways
          : [],

      status:
        alreadyVerified
          ? 'verified'
          : 'research_required',

      qualification: {
        title: null,
        type: null,
        saqa_id: null,
        nqf_level: null,
        credits: null,
        source_url: null
      },

      provider: {
        institution_name: null,
        verification_status: null,
        official_source_url: null
      },

      programme: {
        name: null,
        academic_year: null,
        programme_url: null,
        application_url: null
      },

      requirements: {
        curriculum: null,
        aps: null,
        subjects: [],
        note: null
      },

      verification: {
        qualification_verified: false,
        provider_verified: false,
        programme_verified: false,
        requirements_verified: false,
        checked_at: null,
        notes: alreadyVerified
          ? 'Existing verified LifePath pathway.'
          : null
      }
    };
  });

  const output = {
    stage: 'LP-3.2D',
    purpose: 'All 88 Career Pathway Verification',
    policy: {
      official_sources_only: true,
      no_fabricated_qualifications: true,
      no_fabricated_programmes: true,
      no_fabricated_requirements: true,
      allow_pending_verification: true
    },

    summary: {
      total_careers: manifest.length,
      already_verified:
        manifest.filter(x => x.status === 'verified').length,
      research_required:
        manifest.filter(x => x.status === 'research_required').length
    },

    careers: manifest
  };

  writeFileSync(
    '.\\data\\lp32d-all88-verification.json',
    JSON.stringify(output, null, 2),
    'utf8'
  );

  console.log('Total careers:', output.summary.total_careers);
  console.log('Already verified:', output.summary.already_verified);
  console.log('Research required:', output.summary.research_required);

  console.log(
    '\nCreated: data/lp32d-all88-verification.json'
  );

  console.log(
    '\n✅ MASTER MANIFEST CREATED — DATABASE UNCHANGED.'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

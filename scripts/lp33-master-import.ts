import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db";

const APPLY = process.argv.includes("--apply");

function readJson(file:string) {
  return JSON.parse(
    fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")
  );
}

function validDate(value:any) {
  if (value == null || value === "") return true;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)))
    return false;

  const [y,m,d] = String(value).split("-").map(Number);
  const date = new Date(Date.UTC(y,m-1,d));

  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m-1 &&
    date.getUTCDate() === d
  );
}

function required(value:any, label:string) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    throw new Error(`Missing required field: ${label}`);
  }
}

function dateOrNull(value:any) {
  if (value == null || value === "") return null;
  if (!validDate(value))
    throw new Error(`Invalid YYYY-MM-DD date: ${value}`);
  return String(value);
}

function normaliseBundle(raw:any, sourceFile:string) {
  if (!Array.isArray(raw.pathways))
    throw new Error(`${sourceFile}: pathways[] missing`);

  return raw.pathways.map((p:any) => {
    required(p.career_slug, `${sourceFile}: career_slug`);
    required(
      p.qualification?.title,
      `${p.career_slug}: qualification.title`
    );
    required(
      p.qualification?.saqa_id,
      `${p.career_slug}: qualification.saqa_id`
    );
    required(
      p.qualification?.nqf_level,
      `${p.career_slug}: qualification.nqf_level`
    );
    required(
      p.qualification?.source_url,
      `${p.career_slug}: qualification.source_url`
    );
    required(
      p.programme?.name,
      `${p.career_slug}: programme.name`
    );
    required(
      p.programme?.academic_year,
      `${p.career_slug}: programme.academic_year`
    );
    required(
      p.programme?.source_url,
      `${p.career_slug}: programme.source_url`
    );

    const q = p.qualification;

    for (const key of [
      "registration_start_date",
      "registration_end_date",
      "last_enrolment_date",
      "last_achievement_date"
    ]) {
      if (!validDate(q[key]))
        throw new Error(
          `${p.career_slug}: invalid ${key}: ${q[key]}`
        );
    }

    return {
      source_file: sourceFile,
      career_slug: p.career_slug,

      qualification: {
        title: q.title,
        qualification_type:
          q.qualification_type ?? null,
        saqa_id: String(q.saqa_id),
        nqf_level: Number(q.nqf_level),
        credits:
          q.credits == null ? null : Number(q.credits),
        field: q.field ?? null,
        subfield: q.subfield ?? null,
        registration_status:
          q.registration_status ?? null,
        registration_start_date:
          dateOrNull(q.registration_start_date),
        registration_end_date:
          dateOrNull(q.registration_end_date),
        last_enrolment_date:
          dateOrNull(q.last_enrolment_date),
        last_achievement_date:
          dateOrNull(q.last_achievement_date),
        source_url: q.source_url
      },

      provider: {
        name:
          p.provider?.name ??
          raw.provider?.name ??
          null,

        slug:
          p.provider?.slug ??
          raw.provider?.slug ??
          null,

        website:
          p.provider?.website ??
          raw.provider?.website ??
          null
      },

      programme: {
        name: p.programme.name,
        programme_code:
          p.programme.programme_code ?? null,
        academic_year:
          Number(p.programme.academic_year),
        duration:
          p.programme.duration ?? null,
        faculty:
          p.programme.faculty ?? null,
        source_url:
          p.programme.source_url,
        application_url:
          p.programme.application_url ?? null
      },

      requirements:
        p.requirements ??
        raw.shared_requirements ??
        null
    };
  });
}

async function main() {
  const sql = db();

  console.log("");
  console.log("LP-3.3 MASTER BULK IMPORT");
  console.log(
    APPLY
      ? "MODE: APPLY — NEON MAY CHANGE"
      : "MODE: DRY RUN — NEON WILL NOT CHANGE"
  );

  // --------------------------------------------------------
  // Discover verified bundles automatically.
  // --------------------------------------------------------

  const dataDir = path.resolve("./data");

  const files = fs.readdirSync(dataDir)
    .filter(name =>
      /^lp33-verified-.*\.json$/i.test(name)
    )
    .sort();

  if (!files.length)
    throw new Error(
      "No LP3.3 verified bundle files found."
    );

  console.log("");
  console.log("Verified bundle files:");
  files.forEach(f => console.log(" -", f));

  const records:any[] = [];

  for (const file of files) {
    const raw = readJson(
      path.join(dataDir, file)
    );

    if (
      raw.verification &&
      raw.verification.ready_for_import !== true
    ) {
      console.log(
        `SKIP ${file}: ready_for_import != true`
      );
      continue;
    }

    records.push(
      ...normaliseBundle(raw, file)
    );
  }

  if (!records.length)
    throw new Error(
      "No verified pathways are ready for import."
    );

  // --------------------------------------------------------
  // Duplicate/conflict checks BEFORE Neon writes.
  // --------------------------------------------------------

  const saqaMap = new Map<string,string>();

  for (const r of records) {
    const existing =
      saqaMap.get(r.qualification.saqa_id);

    if (
      existing &&
      existing !== r.qualification.title
    ) {
      throw new Error(
        `SAQA conflict ${r.qualification.saqa_id}: ` +
        `"${existing}" vs "${r.qualification.title}"`
      );
    }

    saqaMap.set(
      r.qualification.saqa_id,
      r.qualification.title
    );
  }

  const careerSlugs = [
    ...new Set(
      records.map(r => r.career_slug)
    )
  ];

  const careers = await sql`
    SELECT id, slug, title
    FROM careers
    WHERE active=true
  `;

  const careerMap = new Map(
    careers.map((c:any) => [c.slug,c])
  );

  for (const slug of careerSlugs) {
    if (!careerMap.has(slug))
      throw new Error(
        `Career does not exist in Neon: ${slug}`
      );
  }

  // --------------------------------------------------------
  // Resolve providers BEFORE transaction.
  // No guessing.
  // --------------------------------------------------------

  const institutions = await sql`
    SELECT
      id,
      name,
      slug,
      verification_status
    FROM institutions
    WHERE active=true
  `;

  function resolveInstitution(r:any) {
    const slug = r.provider.slug;
    const name = r.provider.name;

    let match:any = null;

    if (slug) {
      match = institutions.find(
        (i:any) => i.slug === slug
      );
    }

    if (!match && name) {
      match = institutions.find(
        (i:any) =>
          i.name.toLowerCase() ===
          String(name).toLowerCase()
      );
    }

    if (!match)
      throw new Error(
        `Provider not found for ${r.career_slug}: ` +
        `${name ?? slug ?? "UNKNOWN"}`
      );

    if (
      match.verification_status !== "verified"
    ) {
      throw new Error(
        `Provider is not verified: ${match.name}`
      );
    }

    return match;
  }

  const resolved = records.map(r => ({
    ...r,
    institution: resolveInstitution(r)
  }));

  console.log("");
  console.log("--- VALIDATED PATHWAYS ---");

  console.table(
    resolved.map(r => ({
      career: r.career_slug,
      saqa: r.qualification.saqa_id,
      nqf: r.qualification.nqf_level,
      provider: r.institution.name,
      year: r.programme.academic_year
    }))
  );

  console.log(
    `Verified pathways ready: ${resolved.length}`
  );

  console.log(
    `Unique careers: ${
      new Set(resolved.map(r => r.career_slug)).size
    }`
  );

  console.log(
    `Unique SAQA qualifications: ${
      new Set(
        resolved.map(r => r.qualification.saqa_id)
      ).size
    }`
  );

  if (!APPLY) {
    console.log("");
    console.log(
      "🔥 DRY RUN PASSED — NO NEON DATA CHANGED"
    );
    console.log(
      "When the full verified catalogue is ready:"
    );
    console.log(
      "npx tsx scripts/lp33-master-import.ts --apply"
    );
    return;
  }

  // --------------------------------------------------------
  // Transactional import.
  // --------------------------------------------------------

  await sql`BEGIN`;

  try {

    for (const r of resolved) {
      const q = r.qualification;
      const career:any =
        careerMap.get(r.career_slug);

      // Qualification UPSERT
      const qRows = await sql`
        INSERT INTO qualifications (
          title,
          qualification_type,
          saqa_id,
          nqf_level,
          credits,
          field,
          subfield,
          registration_status,
          registration_start_date,
          registration_end_date,
          last_enrolment_date,
          last_achievement_date,
          source_url,
          active
        )
        VALUES (
          ${q.title},
          ${q.qualification_type},
          ${q.saqa_id},
          ${q.nqf_level},
          ${q.credits},
          ${q.field},
          ${q.subfield},
          ${q.registration_status},
          ${q.registration_start_date},
          ${q.registration_end_date},
          ${q.last_enrolment_date},
          ${q.last_achievement_date},
          ${q.source_url},
          true
        )
        ON CONFLICT (saqa_id)
        DO UPDATE SET
          title=EXCLUDED.title,
          qualification_type=
            EXCLUDED.qualification_type,
          nqf_level=EXCLUDED.nqf_level,
          credits=EXCLUDED.credits,
          field=EXCLUDED.field,
          subfield=EXCLUDED.subfield,
          registration_status=
            EXCLUDED.registration_status,
          registration_start_date=
            EXCLUDED.registration_start_date,
          registration_end_date=
            EXCLUDED.registration_end_date,
          last_enrolment_date=
            EXCLUDED.last_enrolment_date,
          last_achievement_date=
            EXCLUDED.last_achievement_date,
          source_url=EXCLUDED.source_url,
          active=true
        RETURNING id
      `;

      const qualificationId =
        qRows[0].id;

      // Career ↔ Qualification
      await sql`
        INSERT INTO career_qualifications (
          career_id,
          qualification_id,
          relevance
        )
        VALUES (
          ${career.id},
          ${qualificationId},
          'primary'
        )
        ON CONFLICT DO NOTHING
      `;

      // Avoid duplicate programme.
      const existingProgramme = await sql`
        SELECT id
        FROM programmes
        WHERE
          qualification_id=${qualificationId}
          AND institution_id=${r.institution.id}
          AND name=${r.programme.name}
          AND academic_year=${r.programme.academic_year}
        LIMIT 1
      `;

      if (!existingProgramme.length) {
        await sql`
          INSERT INTO programmes (
            qualification_id,
            institution_id,
            name,
            programme_code,
            academic_year,
            duration,
            faculty,
            requirements,
            source_url,
            application_url,
            verification_status,
            active
          )
          VALUES (
            ${qualificationId},
            ${r.institution.id},
            ${r.programme.name},
            ${r.programme.programme_code},
            ${r.programme.academic_year},
            ${r.programme.duration},
            ${r.programme.faculty},
            ${
              r.requirements
                ? JSON.stringify(r.requirements)
                : null
            }::jsonb,
            ${r.programme.source_url},
            ${r.programme.application_url},
            'verified',
            true
          )
        `;
      }
    }

    await sql`COMMIT`;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }

  // --------------------------------------------------------
  // Whole catalogue audit.
  // --------------------------------------------------------

  const audit = await sql`
    SELECT
      c.slug,
      c.title,
      COUNT(DISTINCT cq.qualification_id)::int
        AS qualifications,
      COUNT(DISTINCT p.id)::int
        AS programmes
    FROM careers c
    LEFT JOIN career_qualifications cq
      ON cq.career_id=c.id
    LEFT JOIN programmes p
      ON p.qualification_id=cq.qualification_id
      AND p.active=true
    WHERE c.active=true
    GROUP BY c.id,c.slug,c.title
    ORDER BY c.title
  `;

  const linked =
    audit.filter(
      (x:any) => Number(x.programmes) > 0
    );

  const pending =
    audit.filter(
      (x:any) => Number(x.programmes) === 0
    );

  console.log("");
  console.log("===== ALL-88 AUDIT =====");
  console.log("Active careers:", audit.length);
  console.log(
    "Programme-linked careers:",
    linked.length
  );
  console.log(
    "Still pending:",
    pending.length
  );

  if (pending.length) {
    console.log("");
    console.log("--- STILL PENDING ---");

    console.table(
      pending.map((x:any) => ({
        slug: x.slug,
        title: x.title
      }))
    );
  }

  console.log("");
  console.log(
    "🔥 LP-3.3 TRANSACTIONAL IMPORT COMPLETE"
  );
}

main().catch(error => {
  console.error("");
  console.error("LP-3.3 FAILED");
  console.error(error);
  process.exit(1);
});


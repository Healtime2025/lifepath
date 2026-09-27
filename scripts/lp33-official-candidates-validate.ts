import fs from "node:fs";

const file =
  "./data/lp33-official-programme-candidates.json";

const data = JSON.parse(
  fs.readFileSync(file,"utf8").replace(/^\uFEFF/,"")
);

const rows = data.programmes ?? [];

if (!Array.isArray(rows) || rows.length === 0)
  throw new Error("No candidate records found.");

const slugs = new Set<string>();

for (const row of rows) {

  if (!row.career_slug)
    throw new Error("career_slug missing");

  if (slugs.has(row.career_slug))
    throw new Error(
      `Duplicate career candidate: ${row.career_slug}`
    );

  slugs.add(row.career_slug);


  // ------------------------------------------
  // SAQA-backed qualification
  // ------------------------------------------

  if (row.saqa_id) {

    if (
      row.qualification_identity_status !== "verified"
    ) {
      throw new Error(
        `${row.career_slug}: SAQA record must be verified`
      );
    }

    if (!row.qualification_title)
      throw new Error(
        `${row.career_slug}: qualification title missing`
      );

    if (!row.nqf_level)
      throw new Error(
        `${row.career_slug}: NQF missing`
      );

    if (!row.credits)
      throw new Error(
        `${row.career_slug}: credits missing`
      );
  }


  // ------------------------------------------
  // University/provider programme
  // ------------------------------------------

  if (row.programme_code) {

    if (!row.provider)
      throw new Error(
        `${row.career_slug}: provider missing`
      );

    if (!row.programme_title)
      throw new Error(
        `${row.career_slug}: programme title missing`
      );

    if (
      row.provider_programme_verified !== true
    ) {
      throw new Error(
        `${row.career_slug}: programme not verified`
      );
    }

    // Prevent accidental fake SAQA linkage.
    if (
      row.qualification_identity_status === "verified" &&
      !row.saqa_id
    ) {
      throw new Error(
        `${row.career_slug}: qualification marked verified without SAQA ID`
      );
    }
  }
}


console.log("");
console.log("==============================================");
console.log(" LP-3.3 OFFICIAL PROGRAMME CANDIDATE AUDIT");
console.log("==============================================");
console.log("");

console.table(
  rows.map((r:any)=>({
    career:r.career_slug,
    route:
      r.programme_code
        ? `${r.provider} / ${r.programme_code}`
        : `SAQA ${r.saqa_id}`,
    qualification:
      r.qualification_identity_status,
    provider_programme:
      r.provider_programme_verified
        ? "VERIFIED"
        : "PENDING"
  }))
);

console.log("");

console.log(
  "Candidate careers:",
  rows.length
);

console.log(
  "Official provider programmes:",
  rows.filter(
    (r:any)=>r.provider_programme_verified===true
  ).length
);

console.log(
  "Verified SAQA qualifications:",
  rows.filter(
    (r:any)=>r.qualification_identity_status==="verified"
  ).length
);

console.log("");

console.log(
  "🔥 CANDIDATE BUNDLE VALIDATED — NO NEON WRITE"
);

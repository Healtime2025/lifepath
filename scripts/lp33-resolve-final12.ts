import fs from "node:fs";

const read = (p:string) =>
  JSON.parse(
    fs.readFileSync(p,"utf8").replace(/^\uFEFF/,"")
  );

const catalogue =
  read("./data/lp33-final-63-catalogue.json");

const resolution =
  read("./data/lp33-final12-official-resolution.json");

const pendingBefore = catalogue.careers
  .filter(
    (x:any) =>
      x.verification_status === "verification_pending"
  )
  .map((x:any)=>x.career_slug)
  .sort();

if (pendingBefore.length !== 12) {
  throw new Error(
    `Expected exactly 12 pending careers before final resolution; found ${pendingBefore.length}`
  );
}

const rows = resolution.careers ?? [];

if (rows.length !== 12) {
  throw new Error(
    `Expected 12 resolution records; found ${rows.length}`
  );
}

const slugs = rows
  .map((x:any)=>x.career_slug)
  .sort();

if (new Set(slugs).size !== 12) {
  throw new Error("Duplicate career in final-12 resolution");
}

if (
  JSON.stringify(slugs) !==
  JSON.stringify(pendingBefore)
) {
  const missing =
    pendingBefore.filter((x:string)=>!slugs.includes(x));

  const unexpected =
    slugs.filter((x:string)=>!pendingBefore.includes(x));

  throw new Error(
    `Final-12 mismatch.
Missing: ${missing.join(", ")}
Unexpected: ${unexpected.join(", ")}`
  );
}

const allowed = new Set([
  "verified_current",
  "verified_lifecycle_issue"
]);

for (const r of rows) {

  if (!allowed.has(r.resolution)) {
    throw new Error(
      `${r.career_slug}: invalid resolution ${r.resolution}`
    );
  }

  if (!r.source_authority) {
    throw new Error(
      `${r.career_slug}: source authority missing`
    );
  }

  if (
    r.resolution === "verified_current" &&
    r.learner_facing_current !== true
  ) {
    throw new Error(
      `${r.career_slug}: current resolution must be learner-facing current`
    );
  }

  if (
    r.saqa_id &&
    !r.qualification_title
  ) {
    throw new Error(
      `${r.career_slug}: SAQA ID without qualification title`
    );
  }
}

const map = new Map(
  catalogue.careers.map(
    (x:any)=>[x.career_slug,x]
  )
);

for (const evidence of rows) {

  const row:any =
    map.get(evidence.career_slug);

  if (!row) {
    throw new Error(
      `Career missing from catalogue: ${evidence.career_slug}`
    );
  }

  row.evidence = [
    ...(row.evidence ?? []),
    evidence
  ];

  row.verification_status =
    evidence.resolution;
}

const careers =
  [...map.values()].sort(
    (a:any,b:any)=>
      a.career_slug.localeCompare(b.career_slug)
  );

const summary = {

  total: careers.length,

  verified_current:
    careers.filter(
      (x:any)=>
        x.verification_status === "verified_current"
    ).length,

  verified_lifecycle_issue:
    careers.filter(
      (x:any)=>
        x.verification_status ===
        "verified_lifecycle_issue"
    ).length,

  verification_pending:
    careers.filter(
      (x:any)=>
        x.verification_status ===
        "verification_pending"
    ).length
};

if (summary.total !== 63) {
  throw new Error(
    `Expected 63 campaign careers; found ${summary.total}`
  );
}

if (summary.verification_pending !== 0) {
  throw new Error(
    `FINAL RESEARCH GATE FAILED: ${summary.verification_pending} careers remain pending`
  );
}

const output = {
  ...catalogue,

  stage:
    "LP-3.3-FINAL-63-RESEARCH-RESOLVED",

  as_of:
    "2026-09-27",

  summary,

  careers
};

fs.writeFileSync(
  "./data/lp33-final-63-catalogue.json",
  JSON.stringify(output,null,2) + "\n",
  "utf8"
);

console.log("");
console.log("================================================");
console.log(" LP-3.3 FINAL RESEARCH RESOLUTION");
console.log("================================================");
console.log("");

console.table(summary);

console.log("");

console.table(
  rows.map((r:any)=>({
    career:r.career_slug,
    resolution:r.resolution,
    saqa:r.saqa_id ?? "-",
    relevance:r.relevance ?? "-"
  }))
);

console.log("");
console.log("Final pending research : 0");
console.log("Neon writes           : ZERO");
console.log("");
console.log("ðŸ”¥ 63-CAREER RESEARCH CAMPAIGN RESOLVED");

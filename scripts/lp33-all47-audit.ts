import fs from "node:fs";

const research = JSON.parse(
  fs.readFileSync(
    "./data/lp33-all47-official-research.json",
    "utf8"
  ).replace(/^\uFEFF/,"")
);

const catalogue = JSON.parse(
  fs.readFileSync(
    "./data/lp33-final-63-catalogue.json",
    "utf8"
  ).replace(/^\uFEFF/,"")
);

const expected = catalogue.careers
  .filter((x:any)=>
    x.verification_status === "verification_pending"
  )
  .map((x:any)=>x.career_slug)
  .sort();

const rows = research.careers ?? [];

if (expected.length !== 47)
  throw new Error(
    `Expected previous pending count 47; found ${expected.length}`
  );

if (rows.length !== 47)
  throw new Error(
    `ALL47 file must contain exactly 47 careers; found ${rows.length}`
  );

const slugs = rows.map((x:any)=>x.career_slug);

if (new Set(slugs).size !== 47)
  throw new Error("Duplicate career in ALL47 research");

const actual = [...slugs].sort();

if (JSON.stringify(actual) !== JSON.stringify(expected)) {

  const missing =
    expected.filter((x:string)=>!actual.includes(x));

  const unexpected =
    actual.filter(x=>!expected.includes(x));

  throw new Error(
    `ALL47 mismatch.
Missing: ${missing.join(", ")}
Unexpected: ${unexpected.join(", ")}`
  );
}

const current = rows.filter(
  (x:any)=>x.learner_facing_current === true
);

const lifecycle = rows.filter(
  (x:any)=>
    x.research_status ===
    "LIFECYCLE_OR_REPLACEMENT_REVIEW"
);

const exactFurther = rows.filter(
  (x:any)=>
    x.research_status ===
    "OFFICIAL_ROUTE_REQUIRES_FURTHER_EXACT_MATCH"
);

for(const r of current){

  if(!r.source_authority)
    throw new Error(
      `${r.career_slug}: current route missing authority`
    );

  if(
    r.saqa_id &&
    !r.qualification_title
  )
    throw new Error(
      `${r.career_slug}: SAQA ID without qualification title`
    );
}

console.log("");
console.log("================================================");
console.log(" LP-3.3 ALL-47 OFFICIAL RESEARCH AUDIT");
console.log("================================================");
console.log("");

console.log("Previous pending careers :", expected.length);
console.log("Research records         :", rows.length);
console.log("Unique careers           :", new Set(slugs).size);
console.log("");

console.log("Current evidence routes  :", current.length);
console.log("Lifecycle/replacement    :", lifecycle.length);
console.log("Exact-match follow-up    :", exactFurther.length);
console.log("");

console.table(
  rows.map((r:any)=>({
    career:r.career_slug,
    status:r.research_status,
    saqa:r.saqa_id ?? "-",
    current:r.learner_facing_current === true
      ? "YES"
      : "NO"
  }))
);

console.log("");
console.log("47 / 47 researched       : PASS");
console.log("Invented career records  : ZERO");
console.log("Neon writes              : ZERO");
console.log("");
console.log("ðŸ”¥ ALL-47 RESEARCH PASS COMPLETE");

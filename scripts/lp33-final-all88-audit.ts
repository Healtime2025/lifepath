import fs from "node:fs";

function read(path:string):any {
  return JSON.parse(
    fs.readFileSync(path,"utf8").replace(/^\uFEFF/,"")
  );
}

function exists(path:string) {
  return fs.existsSync(path);
}

const manifestPath =
  "./data/lp32d-all88-verification.json";

const campaignPath =
  "./data/lp33-all63-master-verification.json";

const evidencePath =
  "./data/lp33-final-official-evidence.json";

const tradePath =
  "./data/lp33-big-trades-occupational-registry.json";

if (!exists(manifestPath))
  throw new Error("Missing all-88 manifest.");

if (!exists(campaignPath))
  throw new Error("Missing all-63 campaign.");

if (!exists(evidencePath))
  throw new Error("Missing final official evidence.");

const manifest=read(manifestPath);
const campaign=read(campaignPath);
const evidence=read(evidencePath);

const campaignCareers =
  campaign.careers ?? [];

if (
  campaignCareers.length !== 63 ||
  new Set(campaignCareers.map((x:any)=>x.slug)).size !== 63
) {
  throw new Error("63-career campaign integrity failed.");
}

const fresh =
  evidence.fresh_official_findings ?? [];

const learnerCurrent =
  fresh.filter((x:any)=>x.learner_facing_current===true);

const lifecycleWarnings =
  fresh.filter((x:any)=>x.learner_facing_current===false);

const programmeEvidence =
  fresh.filter((x:any)=>x.evidence_type==="official_programme");

const qualificationEvidence =
  fresh.filter((x:any)=>
    x.evidence_type==="official_qualification" ||
    x.evidence_type==="official_qualification_related"
  );


// ----------------------------------------------------------
// Scan verified importer bundles.
// ----------------------------------------------------------

const bundleFiles=fs
  .readdirSync("./data")
  .filter(x=>
    /^lp33-verified-.*\.json$/i.test(x)
  );

const bundleCareers=new Set<string>();

for (const file of bundleFiles) {

  const d=read("./data/"+file);

  const rows=
    Array.isArray(d) ? d :
    d.pathways ??
    d.records ??
    d.items ??
    [];

  for (const r of rows) {
    if (r.career_slug)
      bundleCareers.add(r.career_slug);
  }
}


// ----------------------------------------------------------
// Existing known programme-linked careers before LP3.3.
// ----------------------------------------------------------

const previouslyLinked=new Set([
  "civil-engineer",
  "professional-nurse",
  "office-administrator",
  "data-capturer",
  "personal-assistant",
  "receptionist"
]);


// ----------------------------------------------------------
// Current official evidence careers.
// ----------------------------------------------------------

const currentEvidenceCareers =
  new Set(
    learnerCurrent.map((x:any)=>x.career_slug)
  );

const lifecycleCareers =
  new Set(
    lifecycleWarnings.map((x:any)=>x.career_slug)
  );


// ----------------------------------------------------------
// Trade registry = research evidence only.
//
// IMPORTANT:
// Never count every old trade route as current merely because
// it exists in that registry.
// ----------------------------------------------------------

let tradeResearchCount=0;

if (exists(tradePath)) {
  const t=read(tradePath);
  tradeResearchCount=(t.routes ?? []).length;
}


// ----------------------------------------------------------
// Build final status for all 63 campaign careers.
// ----------------------------------------------------------

const statuses=campaignCareers.map((c:any)=>{

  const slug=c.slug;

  let status="OFFICIAL_RESEARCH_PENDING";

  if (previouslyLinked.has(slug))
    status="PROGRAMME_ALREADY_LINKED";

  if (bundleCareers.has(slug))
    status="VERIFIED_BUNDLE_READY";

  if (currentEvidenceCareers.has(slug))
    status="CURRENT_OFFICIAL_EVIDENCE_FOUND";

  if (lifecycleCareers.has(slug) &&
      !currentEvidenceCareers.has(slug))
    status="LIFECYCLE_OR_REPLACEMENT_REVIEW";

  return {
    career:slug,
    lane:c.lane,
    status
  };
});

const counts=statuses.reduce(
  (a:any,x:any)=>{
    a[x.status]=(a[x.status]??0)+1;
    return a;
  },
  {}
);

console.log("");
console.log("================================================");
console.log(" LIFEPath — ALL-88 OFFICIAL EVIDENCE AUDIT");
console.log("================================================");
console.log("");

console.log("Campaign careers               :",campaignCareers.length);
console.log("Verified bundle careers        :",bundleCareers.size);
console.log("Fresh current evidence careers :",currentEvidenceCareers.size);
console.log("Lifecycle/replacement warnings :",lifecycleCareers.size);
console.log("Trade research rows            :",tradeResearchCount);
console.log("");

console.log("===== STATUS COUNTS =====");
console.table(
  Object.entries(counts)
    .map(([status,count])=>({status,count}))
);

console.log("");
console.log("===== CURRENT OFFICIAL PROGRAMMES =====");
console.table(
  programmeEvidence.map((x:any)=>({
    career:x.career_slug,
    provider:x.provider,
    programme:x.programme_title,
    year:x.academic_year
  }))
);

console.log("");
console.log("===== CURRENT OFFICIAL QUALIFICATIONS =====");
console.table(
  qualificationEvidence.map((x:any)=>({
    career:x.career_slug,
    saqa:x.saqa_id,
    nqf:x.nqf_level,
    status:x.registration_status
  }))
);

console.log("");
console.log("===== LIFECYCLE / REPLACEMENT REVIEW =====");
console.table(
  lifecycleWarnings.map((x:any)=>({
    career:x.career_slug,
    saqa:x.saqa_id ?? x.old_saqa_id ?? "-",
    status:
      x.registration_status ??
      x.old_status ??
      x.evidence_type
  }))
);

const pending=statuses.filter(
  (x:any)=>x.status==="OFFICIAL_RESEARCH_PENDING"
);

console.log("");
console.log("===== STILL REQUIRING OFFICIAL EVIDENCE =====");

console.table(pending);

console.log("");
console.log(
  "Remaining official-research careers:",
  pending.length
);

console.log("");

if (pending.length>0) {
  console.log(
    "IMPORT POLICY: verified/current records may be imported, " +
    "but pending careers MUST NOT receive invented programmes."
  );
} else {
  console.log(
    "🔥 ALL CAMPAIGN CAREERS HAVE OFFICIAL EVIDENCE"
  );
}

console.log("");
console.log(
  "Neon catalogue changed: NO"
);

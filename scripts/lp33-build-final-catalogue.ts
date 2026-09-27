import fs from "node:fs";

const read=(p:string)=>
  JSON.parse(fs.readFileSync(p,"utf8").replace(/^\uFEFF/,""));

const campaign=read(
  "./data/lp33-all63-master-verification.json"
);

const evidence=read(
  "./data/lp33-final-official-evidence.json"
);

const candidates=read(
  "./data/lp33-official-programme-candidates.json"
);

const campaignRows=campaign.careers ?? [];
const evidenceRows=evidence.fresh_official_findings ?? [];
const candidateRows=candidates.programmes ?? [];

if (campaignRows.length!==63)
  throw new Error(
    `Expected 63 campaign careers; found ${campaignRows.length}`
  );

const map=new Map<string,any>();

for(const c of campaignRows){
  map.set(c.slug,{
    career_slug:c.slug,
    lane:c.lane,
    verification_status:"verification_pending",
    evidence:[]
  });
}


// ========================================================
// EXISTING OFFICIAL EVIDENCE
// ========================================================

for(const e of evidenceRows){

  const row=map.get(e.career_slug);

  if(!row) continue;

  row.evidence.push(e);

  if(e.learner_facing_current===true)
    row.verification_status="verified_current";

  if(
    e.learner_facing_current===false &&
    row.verification_status!=="verified_current"
  )
    row.verification_status="verified_lifecycle_issue";
}


// ========================================================
// OFFICIAL PROGRAMME / QUALIFICATION CANDIDATES
// ========================================================

for(const c of candidateRows){

  const row=map.get(c.career_slug);

  if(!row) continue;

  row.evidence.push(c);

  const programmeVerified=
    c.provider_programme_verified===true;

  const qualificationVerified=
    c.qualification_identity_status==="verified";

  if(programmeVerified || qualificationVerified)
    row.verification_status="verified_current";
}


// ========================================================
// FRESH OFFICIAL TECHNOLOGY EVIDENCE
// ========================================================

const freshTech=[

  {
    career_slug:"cybersecurity-specialist",
    relevance:"primary",

    saqa_id:"122068",
    qualification_title:
      "Advanced Occupational Certificate: Cybersecurity Practitioner",

    qualification_type:
      "Advanced Occupational Certificate",

    nqf_level:6,
    credits:120,

    registration_status:"Registered",
    registration_start_date:"2024-01-30",
    registration_end_date:"2029-01-30",
    last_enrolment_date:"2030-01-30",
    last_achievement_date:"2033-01-30",

    qualification_identity_status:"verified",
    provider_status:"verification_pending",

    source_authority:"SAQA",
    source_type:"official_qualification_register",

    learner_facing_current:true
  },

  {
    career_slug:"data-scientist",
    relevance:"primary",

    provider:"University of Pretoria",
    provider_slug:"up",

    programme_title:
      "BCom specialising in Statistics and Data Science",

    programme_code:"07130264",
    academic_year:2027,
    duration_years:3,

    requirements:{
      english:5,
      mathematics:5,
      aps:32
    },

    provider_programme_verified:true,
    qualification_identity_status:"verification_pending",

    source_authority:"University of Pretoria",
    source_type:"official_university",

    learner_facing_current:true
  },

  {
    career_slug:"software-developer",
    relevance:"primary",

    provider:"University of Pretoria",
    provider_slug:"up",

    programme_title:"BSc in Computer Science",
    programme_code:"12134002",

    academic_year:2027,
    duration_years:3,

    requirements:{
      english:5,
      mathematics:6,
      aps:30
    },

    provider_programme_verified:true,
    qualification_identity_status:"verification_pending",

    source_authority:"University of Pretoria",
    source_type:"official_university",

    learner_facing_current:true
  },

  {
    career_slug:"ai-ml-specialist",
    relevance:"related",

    provider:"University of Pretoria",
    provider_slug:"up",

    programme_title:"BSc in Computer Science",
    programme_code:"12134002",

    academic_year:2027,
    duration_years:3,

    requirements:{
      english:5,
      mathematics:6,
      aps:30
    },

    provider_programme_verified:true,
    qualification_identity_status:"verification_pending",

    route_note:
      "Foundation route into advanced computer science and AI/ML study.",

    source_authority:"University of Pretoria",
    source_type:"official_university",

    learner_facing_current:true
  }

];

for(const e of freshTech){

  const row=map.get(e.career_slug);

  if(!row)
    throw new Error(
      `Technology career missing from campaign: ${e.career_slug}`
    );

  row.evidence.push(e);
  row.verification_status="verified_current";
}


// ========================================================
// FINAL CATALOGUE
// ========================================================

const rows=[...map.values()]
  .sort((a,b)=>
    a.career_slug.localeCompare(b.career_slug)
  );

const summary={
  total:rows.length,

  verified_current:
    rows.filter(
      x=>x.verification_status==="verified_current"
    ).length,

  verified_lifecycle_issue:
    rows.filter(
      x=>x.verification_status==="verified_lifecycle_issue"
    ).length,

  verification_pending:
    rows.filter(
      x=>x.verification_status==="verification_pending"
    ).length
};

const output={
  stage:"LP-3.3-FINAL-63-CATALOGUE",
  as_of:"2026-09-27",

  policy:{
    official_sources_only:true,
    invented_data_forbidden:true,
    pending_is_valid_catalogue_state:true,
    pending_records_not_imported_as_verified:true,
    expired_records_not_presented_as_current:true
  },

  summary,
  careers:rows
};

fs.writeFileSync(
  "./data/lp33-final-63-catalogue.json",
  JSON.stringify(output,null,2)+"\n",
  "utf8"
);

console.log("");
console.log("==============================================");
console.log(" LP-3.3 FINAL 63-CAREER CATALOGUE");
console.log("==============================================");
console.log("");

console.table(summary);

console.log("");
console.log("===== PENDING =====");

console.table(
  rows
    .filter(
      x=>x.verification_status==="verification_pending"
    )
    .map(x=>({
      career:x.career_slug,
      lane:x.lane
    }))
);

console.log("");
console.log(
  "🔥 ALL 63 CAREERS NOW HAVE AN EXPLICIT VERIFICATION STATE"
);
console.log(
  "No pending record has been promoted to verified."
);
console.log(
  "Neon writes: ZERO"
);

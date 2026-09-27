import fs from "node:fs";

const read=(p:string)=>
 JSON.parse(
  fs.readFileSync(p,"utf8").replace(/^\uFEFF/,"")
 );

const catalogue=
 read("./data/lp33-final-63-catalogue.json");

const research=
 read("./data/lp33-all47-official-research.json");

const map=new Map(
 catalogue.careers.map(
  (x:any)=>[x.career_slug,x]
 )
);

for(const evidence of research.careers){

 const row:any=map.get(evidence.career_slug);

 if(!row)
   throw new Error(
    `Career not found: ${evidence.career_slug}`
   );

 row.evidence = [
   ...(row.evidence ?? []),
   evidence
 ];

 if(evidence.learner_facing_current === true){

   row.verification_status =
     "verified_current";

 } else if(
   evidence.research_status ===
   "LIFECYCLE_OR_REPLACEMENT_REVIEW"
 ){

   row.verification_status =
     "verified_lifecycle_issue";

 } else {

   row.verification_status =
     "verification_pending";
 }
}

const careers=[...map.values()]
 .sort((a:any,b:any)=>
   a.career_slug.localeCompare(b.career_slug)
 );

const summary={
 total:careers.length,

 verified_current:
  careers.filter(
   (x:any)=>
    x.verification_status==="verified_current"
  ).length,

 verified_lifecycle_issue:
  careers.filter(
   (x:any)=>
    x.verification_status==="verified_lifecycle_issue"
  ).length,

 verification_pending:
  careers.filter(
   (x:any)=>
    x.verification_status==="verification_pending"
  ).length
};

const output={
 ...catalogue,
 stage:"LP-3.3-FINAL-63-AFTER-ALL47-RESEARCH",
 as_of:"2026-09-27",
 summary,
 careers
};

fs.writeFileSync(
 "./data/lp33-final-63-catalogue.json",
 JSON.stringify(output,null,2)+"\n",
 "utf8"
);

console.log("");
console.log("===== UPDATED FINAL CATALOGUE =====");
console.table(summary);
console.log("");

console.log("Remaining exact-match research:");

console.table(
 careers
  .filter(
   (x:any)=>
    x.verification_status==="verification_pending"
  )
  .map(
   (x:any)=>({
    career:x.career_slug,
    lane:x.lane
   })
  )
);

console.log("");
console.log(
 "🔥 ALL-47 EVIDENCE MERGED INTO FINAL CATALOGUE"
);
console.log(
 "Neon writes: ZERO"
);

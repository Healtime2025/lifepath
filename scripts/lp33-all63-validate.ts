import fs from "node:fs";

const path = "./data/lp33-all63-master-verification.json";

const data = JSON.parse(
  fs.readFileSync(path,"utf8").replace(/^\uFEFF/,"")
);

const careers = data.careers ?? [];
const findings = data.current_official_findings ?? [];

if (careers.length !== 63) {
  throw new Error(
    `Expected exactly 63 remaining careers, found ${careers.length}`
  );
}

const slugs = careers.map((x:any) => x.slug);
const unique = new Set(slugs);

if (unique.size !== 63) {
  throw new Error(
    `Duplicate career slugs detected: ${63 - unique.size}`
  );
}

const invalidFindings = findings.filter(
  (x:any) => !unique.has(x.career_slug)
);

if (invalidFindings.length) {
  console.table(invalidFindings);
  throw new Error(
    "Official finding references a career outside the 63-career campaign."
  );
}

const byLane = careers.reduce(
  (acc:Record<string,number>,x:any) => {
    acc[x.lane]=(acc[x.lane] ?? 0)+1;
    return acc;
  },
  {}
);

console.log("");
console.log("===== ALL-63 MASTER CAMPAIGN =====");
console.log("Careers in campaign       :", careers.length);
console.log("Unique career slugs       :", unique.size);
console.log("Official findings seeded  :", findings.length);

console.log("");
console.log("===== VERIFICATION LANES =====");
console.table(
  Object.entries(byLane)
    .sort((a:any,b:any)=>b[1]-a[1])
    .map(([lane,count])=>({lane,count}))
);

console.log("");
console.log("===== CURRENT OFFICIAL FINDINGS =====");
console.table(
  findings.map((x:any)=>({
    career:x.career_slug,
    saqa:x.saqa_id ?? "-",
    status:x.status
  }))
);

console.log("");
console.log("🔥 ALL 63 CAREERS ARE NOW IN ONE VERIFICATION CAMPAIGN");
console.log("No unverified provider programmes were created.");
console.log("No Neon catalogue data changed.");

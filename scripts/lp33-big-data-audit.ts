import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import fs from "node:fs";
import { db } from "../lib/db";

function readJson(file:string) {
  return JSON.parse(
    fs.readFileSync(file,"utf8").replace(/^\uFEFF/,"")
  );
}

async function main() {
  const sql = db();

  const registry = readJson(
    "./data/lp33-big-trades-occupational-registry.json"
  );

  const careers = await sql`
    SELECT slug,title,category
    FROM careers
    WHERE active=true
    ORDER BY title
  `;

  const careerMap = new Map(
    careers.map((x:any) => [x.slug,x])
  );

  const missing:any[] = [];
  const valid:any[] = [];

  for (const route of registry.routes) {
    const career:any = careerMap.get(route.career_slug);

    if (!career) {
      missing.push({
        slug: route.career_slug,
        occupation: route.occupation
      });
      continue;
    }

    valid.push({
      career: career.title,
      slug: career.slug,
      saqa: route.saqa_id,
      nqf: route.nqf_level,
      credits: route.credits,
      status: route.status
    });
  }

  console.log("");
  console.log("===== OFFICIAL TRADE ROUTES =====");
  console.table(valid);

  if (missing.length) {
    console.log("");
    console.log("===== INVALID CAREER SLUGS =====");
    console.table(missing);
    throw new Error(
      `${missing.length} registry routes do not match the 88-career catalogue`
    );
  }

  const linked = await sql`
    SELECT DISTINCT c.slug
    FROM careers c
    JOIN career_qualifications cq
      ON cq.career_id=c.id
    JOIN programmes p
      ON p.qualification_id=cq.qualification_id
    WHERE c.active=true
      AND p.active=true
  `;

  const programmeLinked = new Set(
    linked.map((x:any) => x.slug)
  );

  const officialRouteSlugs = new Set(
    registry.routes.map((x:any) => x.career_slug)
  );

  const preparedBundles = fs.readdirSync("./data")
    .filter((x:string) =>
      /^lp33-verified-.*\.json$/i.test(x)
    );

  const prepared = new Set<string>();

  for (const file of preparedBundles) {
    const json = readJson("./data/" + file);

    for (const pathway of json.pathways ?? []) {
      prepared.add(pathway.career_slug);
    }
  }

  const covered = new Set([
    ...programmeLinked,
    ...prepared,
    ...officialRouteSlugs
  ]);

  const pending = careers.filter(
    (x:any) => !covered.has(x.slug)
  );

  console.log("");
  console.log("===== LP3.3 COVERAGE =====");
  console.log("Active careers               :", careers.length);
  console.log("Already programme-linked     :", programmeLinked.size);
  console.log("Prepared verified bundles    :", prepared.size);
  console.log("Official trade routes mapped :", officialRouteSlugs.size);
  console.log("Combined careers touched     :", covered.size);
  console.log("Still requiring research     :", pending.length);

  console.log("");
  console.log("===== STILL REQUIRING RESEARCH =====");

  console.table(
    pending.map((x:any) => ({
      slug: x.slug,
      title: x.title,
      category: x.category
    }))
  );

  console.log("");
  console.log(
    "ðŸ”¥ BIG TRADE/OCCUPATIONAL DATA PASS VALIDATED"
  );
  console.log(
    "No provider or programme records were invented."
  );
  console.log(
    "No Neon catalogue data changed."
  );
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

import fs from "node:fs";

type Gate = {
  name: string;
  passed: boolean;
  detail: string;
};

function exists(path:string) {
  return fs.existsSync(path);
}

function json(path:string) {
  return JSON.parse(
    fs.readFileSync(path,"utf8").replace(/^\uFEFF/,"")
  );
}

const gates:Gate[] = [];

const all88 =
  "./data/lp32d-all88-verification.json";

const all63 =
  "./data/lp33-all63-master-verification.json";

const trades =
  "./data/lp33-big-trades-occupational-registry.json";

const engineering =
  "./data/lp33-verified-engineering-bundle.json";

const higher =
  "./data/lp33-verified-higher-education-bundle.json";

gates.push({
  name:"88-career manifest",
  passed:exists(all88),
  detail:all88
});

gates.push({
  name:"63-career final campaign",
  passed:exists(all63),
  detail:all63
});

gates.push({
  name:"Trade/occupational registry",
  passed:exists(trades),
  detail:trades
});

gates.push({
  name:"Engineering verified bundle",
  passed:exists(engineering),
  detail:engineering
});

gates.push({
  name:"Higher education verified bundle",
  passed:exists(higher),
  detail:higher
});

if (exists(all63)) {

  const d=json(all63);
  const careers=d.careers ?? [];

  gates.push({
    name:"All 63 campaign careers present",
    passed:
      careers.length===63 &&
      new Set(careers.map((x:any)=>x.slug)).size===63,
    detail:`${careers.length} records`
  });
}

if (exists(trades)) {

  const d=json(trades);
  const routes=d.routes ?? [];

  gates.push({
    name:"Official trade research registry",
    passed:routes.length===11,
    detail:`${routes.length} routes`
  });
}

const transactionBlocked =
  exists("./data/lp33-transaction-fix-required.txt");

gates.push({
  name:"Atomic Neon bulk-import engine",
  passed:!transactionBlocked,
  detail:transactionBlocked
    ? "BLOCKED — transaction implementation must be fixed"
    : "Ready"
});

console.log("");
console.log("==========================================");
console.log(" LP-3.3 FINAL CATALOGUE GATE");
console.log("==========================================");
console.log("");

console.table(
  gates.map(g=>({
    gate:g.name,
    status:g.passed ? "PASS" : "BLOCK",
    detail:g.detail
  }))
);

const blocked=gates.filter(g=>!g.passed);

console.log("");

if (blocked.length) {

  console.log(
    `FINAL IMPORT BLOCKED BY ${blocked.length} GATE(S)`
  );

  for (const b of blocked)
    console.log(" -",b.name,":",b.detail);

  console.log("");
  console.log(
    "This is intentional protection against a partial Neon import."
  );

  process.exit(2);
}

console.log("🔥 FINAL CATALOGUE GATE PASSED");
console.log("Bulk import may proceed.");

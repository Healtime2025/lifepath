import fs from "node:fs";
import path from "node:path";

const dir = "./data";

const files =
  fs.readdirSync(dir)
    .filter(
      x =>
        x.startsWith("lp33-verified-") &&
        x.endsWith(".json")
    )
    .sort();

console.log("");
console.log("==============================================");
console.log(" EXISTING VERIFIED BUNDLE AUDIT");
console.log("==============================================");
console.log("");

console.log("Bundle files:", files.length);

let total = 0;

for (const file of files) {

  const d =
    JSON.parse(
      fs.readFileSync(
        path.join(dir,file),
        "utf8"
      ).replace(/^\uFEFF/,"")
    );

  const rows =
    d.pathways ??
    d.records ??
    d.careers ??
    [];

  console.log(
    `${file}: ${rows.length} pathway(s)`
  );

  total += rows.length;
}

console.log("");
console.log("Existing bundle pathways:", total);
console.log("");

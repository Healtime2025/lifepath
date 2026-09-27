import fs from "node:fs";

const read = (p:string) =>
  JSON.parse(fs.readFileSync(p,"utf8").replace(/^\uFEFF/,""));

const catalogue =
  read("./data/lp33-final-63-catalogue.json");

const current =
  catalogue.careers.filter(
    (x:any) => x.verification_status === "verified_current"
  );

if (current.length !== 44) {
  throw new Error(
    `Expected 44 verified-current campaign careers; found ${current.length}`
  );
}

function evidenceScore(e:any) {

  const hasQualification =
    Boolean(e?.saqa_id && e?.qualification_title);

  const hasProvider =
    Boolean(e?.provider);

  const hasProgramme =
    Boolean(
      e?.programme_title ||
      (
        e?.provider &&
        e?.qualification_title &&
        (
          e?.research_status ===
            "CURRENT_OFFICIAL_QUALIFICATION_FOUND" ||
          e?.research_status ===
            "CURRENT_RELATED_OFFICIAL_QUALIFICATION_FOUND"
        )
      )
    );

  const hasNqf =
    Number.isFinite(Number(e?.nqf_level));

  const hasCredits =
    Number.isFinite(Number(e?.credits));

  const providerProgrammeVerified =
    e?.provider_programme_verified === true;

  return {
    hasQualification,
    hasProvider,
    hasProgramme,
    hasNqf,
    hasCredits,
    providerProgrammeVerified
  };
}

const rows = current.map((career:any) => {

  const evidence =
    [...(career.evidence ?? [])]
      .reverse()
      .find((e:any) =>
        e?.learner_facing_current === true
      ) ?? null;

  const score = evidenceScore(evidence);

  /*
   * IMPORTANT:
   *
   * importer_ready_strict means:
   * - official qualification identity
   * - NQF
   * - credits
   * - provider
   * - programme/provider relationship explicitly verified
   *
   * Merely having provider text on a SAQA qualification
   * does NOT automatically prove a current offered programme.
   */

  const importerReadyStrict =
    score.hasQualification &&
    score.hasNqf &&
    score.hasCredits &&
    score.hasProvider &&
    score.hasProgramme &&
    score.providerProgrammeVerified;

  let disposition = "qualification_or_route_only";

  if (importerReadyStrict) {
    disposition = "importer_ready_strict";
  } else if (
    score.hasQualification &&
    score.hasProvider
  ) {
    disposition = "provider_programme_verification_required";
  } else if (score.hasQualification) {
    disposition = "qualification_verified_provider_pending";
  } else {
    disposition = "official_route_verified_not_programme_importable";
  }

  return {
    career_slug: career.career_slug,
    lane: career.lane ?? null,
    relevance: evidence?.relevance ?? "primary",

    disposition,

    saqa_id: evidence?.saqa_id ?? null,
    qualification_title:
      evidence?.qualification_title ?? null,

    nqf_level:
      evidence?.nqf_level ?? null,

    credits:
      evidence?.credits ?? null,

    provider:
      evidence?.provider ?? null,

    programme_title:
      evidence?.programme_title ?? null,

    programme_code:
      evidence?.programme_code ?? null,

    academic_year:
      evidence?.academic_year ?? null,

    provider_programme_verified:
      score.providerProgrammeVerified,

    source_authority:
      evidence?.source_authority ?? null
  };
});

const summary = {
  total_current: rows.length,

  importer_ready_strict:
    rows.filter(
      (x:any) => x.disposition === "importer_ready_strict"
    ).length,

  provider_programme_verification_required:
    rows.filter((x:any) =>
        x.disposition ===
        "provider_programme_verification_required"
    ).length,

  qualification_verified_provider_pending:
    rows.filter((x:any) =>
        x.disposition ===
        "qualification_verified_provider_pending"
    ).length,

  official_route_verified_not_programme_importable:
    rows.filter((x:any) =>
        x.disposition ===
        "official_route_verified_not_programme_importable"
    ).length
};

const output = {
  stage: "LP-3.3-IMPORT-READINESS",
  as_of: "2026-09-27",
  policy: {
    research_verified_does_not_equal_importer_ready: true,
    qualification_and_programme_verified_separately: true,
    provider_name_alone_does_not_prove_current_offering: true,
    lifecycle_records_excluded: true
  },
  summary,
  careers: rows
};

fs.writeFileSync(
  "./data/lp33-import-readiness.json",
  JSON.stringify(output,null,2) + "\n",
  "utf8"
);

console.log("");
console.log("================================================");
console.log(" 44-CURRENT IMPORT READINESS");
console.log("================================================");
console.log("");

console.table(summary);

console.log("");

console.table(
  rows.map((x:any) => ({
    career: x.career_slug,
    disposition: x.disposition,
    saqa: x.saqa_id ?? "-",
    provider: x.provider ?? "-",
    programmeVerified:
      x.provider_programme_verified ? "YES" : "NO"
  }))
);

console.log("");
console.log("Invented programmes : ZERO");
console.log("Neon writes         : ZERO");

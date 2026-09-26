import { readFileSync, writeFileSync } from 'node:fs';

type Career = {
  number: number;
  career_slug: string;
  career_title: string;
  category: string;
  expected_pathways: string[];
  status: string;
};

const manifestPath =
  '.\\data\\lp32d-all88-verification.json';

const outputPath =
  '.\\data\\lp32e-verification-lanes.json';

const manifest = JSON.parse(
  readFileSync(manifestPath, 'utf8')
);

function classify(pathways: string[]) {

  const p = new Set(pathways || []);

  const university =
    p.has('university') ||
    p.has('university_of_technology');

  const tvet =
    p.has('tvet');

  const occupational =
    p.has('occupational');

  const apprenticeship =
    p.has('apprenticeship');

  const learnership =
    p.has('learnership');

  const selfEmployment =
    p.has('self_employment');

  let primary_lane = 'manual_review';

  if (apprenticeship) {
    primary_lane = 'trade_apprenticeship';
  }
  else if (occupational) {
    primary_lane = 'occupational';
  }
  else if (tvet) {
    primary_lane = 'tvet';
  }
  else if (university) {
    primary_lane = 'higher_education';
  }
  else if (learnership) {
    primary_lane = 'learnership';
  }

  return {
    primary_lane,

    lanes: {
      higher_education: university,
      tvet,
      occupational,
      apprenticeship,
      learnership,
      self_employment: selfEmployment
    },

    verification_sources: {
      qualification:
        university || tvet || occupational || apprenticeship
          ? ['SAQA']
          : [],

      higher_education:
        university
          ? ['SAQA', 'DHET', 'official_institution']
          : [],

      tvet:
        tvet
          ? ['DHET', 'SAQA', 'official_college']
          : [],

      occupational:
        occupational
          ? ['QCTO', 'SAQA', 'DHET']
          : [],

      trade:
        apprenticeship
          ? ['QCTO', 'SAQA', 'DHET']
          : [],

      learnership:
        learnership
          ? ['QCTO', 'relevant_SETA', 'SAQA']
          : []
    }
  };
}

const careers = manifest.careers.map((career: Career) => ({
  number: career.number,
  career_slug: career.career_slug,
  career_title: career.career_title,
  category: career.category,
  existing_status: career.status,
  expected_pathways: career.expected_pathways,
  ...classify(career.expected_pathways)
}));

const laneCounts: Record<string, number> = {};

for (const career of careers) {
  laneCounts[career.primary_lane] =
    (laneCounts[career.primary_lane] || 0) + 1;
}

const output = {
  stage: 'LP-3.2E',
  purpose: 'Official pathway verification routing',

  rules: {
    official_sources_only: true,
    no_guessing: true,
    no_unverified_database_inserts: true,
    verify_provider_and_programme_separately: true,
    preserve_multiple_valid_pathways: true
  },

  totals: {
    careers: careers.length,
    already_verified:
      careers.filter(
        (x:any) => x.existing_status === 'verified'
      ).length,

    requiring_research:
      careers.filter(
        (x:any) => x.existing_status !== 'verified'
      ).length,

    primary_lanes: laneCounts
  },

  careers
};

writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log('\n===== LP-3.2E VERIFICATION LANES =====\n');

console.table(
  Object.entries(laneCounts).map(([lane,count]) => ({
    lane,
    careers: count
  }))
);

console.log('\nTotal careers:', careers.length);

console.log(
  'Already verified:',
  output.totals.already_verified
);

console.log(
  'Still requiring research:',
  output.totals.requiring_research
);

console.log(
  '\nCreated:',
  'data/lp32e-verification-lanes.json'
);

console.log(
  '\n✅ CLASSIFICATION COMPLETE — DATABASE UNCHANGED.'
);

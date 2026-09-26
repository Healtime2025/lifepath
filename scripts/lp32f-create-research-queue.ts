import { readFileSync, writeFileSync } from 'node:fs';

const source =
  JSON.parse(
    readFileSync(
      '.\\data\\lp32e-verification-lanes.json',
      'utf8'
    )
  );

const queue = source.careers
  .filter((career:any) =>
    career.existing_status !== 'verified'
  )
  .map((career:any, index:number) => ({

    queue_number: index + 1,

    career_slug: career.career_slug,
    career_title: career.career_title,
    category: career.category,

    primary_lane: career.primary_lane,

    expected_pathways:
      career.expected_pathways,

    research_status: 'pending',

    official_research: {

      qualification: {
        title: null,
        saqa_id: null,
        nqf_level: null,
        credits: null,
        registration_status: null,
        source_url: null
      },

      occupational: {
        qcto_reference: null,
        trade_status: null,
        source_url: null
      },

      provider: {
        name: null,
        provider_type: null,
        officially_verified: false,
        source_url: null
      },

      programme: {
        name: null,
        academic_year: null,
        source_url: null
      },

      entry_requirements: {
        curriculum: null,
        aps: null,
        subjects: [],
        source_url: null
      }

    },

    verification: {
      qualification_verified: false,
      provider_verified: false,
      programme_verified: false,
      requirements_verified: false,
      ready_for_import: false,
      notes: null
    }

  }));

const byLane =
  queue.reduce(
    (acc:any, career:any) => {

      if (!acc[career.primary_lane]) {
        acc[career.primary_lane] = [];
      }

      acc[career.primary_lane].push(
        career.career_slug
      );

      return acc;
    },
    {}
  );

const output = {

  stage: 'LP-3.2F',

  purpose:
    'Official-source research queue for remaining LifePath careers',

  policy: {
    official_sources_only: true,
    never_guess_saqa_id: true,
    never_guess_programme: true,
    never_guess_entry_requirements: true,
    provider_and_programme_verified_separately: true,
    multiple_valid_routes_allowed: true
  },

  totals: {
    research_queue: queue.length,
    by_lane: Object.fromEntries(
      Object.entries(byLane)
        .map(([lane, careers]:any) => [
          lane,
          careers.length
        ])
    )
  },

  queue
};

writeFileSync(
  '.\\data\\lp32f-official-research-queue.json',
  JSON.stringify(output, null, 2),
  'utf8'
);

console.log(
  '\n===== OFFICIAL RESEARCH QUEUE =====\n'
);

console.table(
  Object.entries(output.totals.by_lane)
    .map(([lane,count]) => ({
      lane,
      careers: count
    }))
);

console.log(
  '\nResearch careers:',
  output.totals.research_queue
);

if (output.totals.research_queue !== 86) {
  throw new Error(
    `Expected 86 careers, found ${output.totals.research_queue}`
  );
}

console.log(
  '\nCreated: data/lp32f-official-research-queue.json'
);

console.log(
  '\n✅ 86-CAREER OFFICIAL RESEARCH QUEUE READY'
);

console.log(
  'Database unchanged.'
);

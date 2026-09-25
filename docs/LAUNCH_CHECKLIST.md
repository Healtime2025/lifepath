# LifePath launch checklist

## Infrastructure

- [ ] Create separate Neon production database
- [ ] Run `npm run db:migrate`
- [ ] Run `npm run db:seed`
- [ ] Configure Vercel production environment
- [ ] Add custom domain and HTTPS
- [ ] Set admin email(s)
- [ ] Configure backup/restore policy for Neon

## Data

- [ ] Confirm the current DHET public-university list
- [ ] Confirm the current DHET public-TVET list and websites
- [ ] Import the latest DHET private higher-education register
- [ ] Import/validate QCTO accredited provider records needed for occupational routes
- [ ] Establish SAQA qualification refresh workflow
- [ ] Import programme-level academic requirements and application links with academic year
- [ ] Load current bursary/funding cycles and closing dates
- [ ] Spot-check every green verified badge against its stored source

## Product

- [ ] Test Grade 9 subject-choice journey
- [ ] Test Grade 10/11 discovery + marks journey
- [ ] Test Grade 12 institution/funding/application journey
- [ ] Test artisan route (e.g. plumber/electrician)
- [ ] Test administrative/service route (e.g. secretary/office administrator)
- [ ] Test out-of-school youth route
- [ ] Test provider-not-found wording
- [ ] Test report upload against multiple school report layouts
- [ ] Test mobile/PWA installation

## AI

- [ ] Configure API key and production model
- [ ] Confirm coach cannot invent provider accreditation or application deadlines
- [ ] Confirm report extraction requires learner review
- [ ] Monitor cost and rate limits

## Security & privacy

- [ ] External security review
- [ ] POPIA/legal review of final privacy notice and child/learner consent flow
- [ ] School data-processing agreements where SchoolCore/school data is shared
- [ ] Rate-limit at edge/WAF in addition to database login attempt tracking
- [ ] Configure transactional email domain (SPF/DKIM/DMARC)
- [ ] Test account deletion and session invalidation

## Operations

- [ ] Assign a data-verification owner
- [ ] Define update SLAs for application deadlines and bursaries
- [ ] Add support/contact process
- [ ] Create incident and data-correction workflow

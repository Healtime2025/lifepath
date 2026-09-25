# LifePath data governance

## Authoritative South African sources

LifePath's initial data model is designed around the following official sources:

- **DHET — Universities in South Africa**  
  `https://www.dhet.gov.za/SitePages/UniversitiesinSA.aspx`
- **DHET — Public TVET Colleges**  
  `https://www.dhet.gov.za/SitePages/TVETlinks.aspx?hl=en-ZA`
- **DHET — Register of Private Higher Education Institutions**  
  DHET Resources / Registers page. Import the latest published register and store that exact register URL/date on each verified record.
- **QCTO — Accredited Skills Development Providers and Assessment Centres**  
  `https://www.qcto.org.za/databases-of-sdps.html`
- **SAQA — Registered Qualifications**  
  `https://regqs.saqa.org.za/search.php`
- **NSFAS**  
  `https://www.nsfas.org.za/`
- **DHET International Scholarships**  
  `https://www.internationalscholarships.dhet.gov.za/`
- **Funza Lushaka**  
  `https://www.funzalushaka.doe.gov.za/`

## Verification rule

An institution/provider may display **VERIFIED** only when LifePath has a current recognised source supporting that status. Store the source URL and verification timestamp.

A provider not found in LifePath must be shown as **not verified in LifePath**, not labelled fraudulent.

## Programme requirements

Requirements must be tied to:
- institution
- programme
- academic year
- official programme/source URL
- verification date

Never silently carry an old requirement forward to a new academic year.

## Funding

Every funding opportunity should have a source URL, provider, opening/closing dates when available, and eligibility data. Expired opportunities should be deactivated or rolled to the newly verified cycle.

## Refresh cadence

Recommended operational cadence:
- Provider/accreditation registers: monthly check; immediate refresh when an authority publishes a new register
- University/TVET application links: before each application cycle and monthly during cycle
- Programme requirements: annual academic-cycle refresh
- Bursaries/funding: weekly during major application periods
- Deadlines: daily/weekly alert checks when near closing

## Privacy

For learners, store only information needed to provide the product. Avoid sending names/emails to the AI layer. Align the final deployment privacy notice and school data-sharing agreements with POPIA and applicable child-data requirements.

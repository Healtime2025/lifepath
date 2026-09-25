# LifePath architecture

## Product principle

LifePath is **complex underneath, simple on the surface**. The learner should always be able to answer “What should I do next?” without understanding the complexity of South Africa's post-school system.

## Core journey

1. Discover me
2. Understand my subjects and marks
3. Explore career possibilities
4. Compare routes (university, UoT, TVET, occupational, apprenticeship, learnership, service, entrepreneurship)
5. Find verified providers
6. Check programme requirements
7. Find funding
8. Apply on the official channel
9. Track progress

## Services in this repository

### Authentication
Database-backed sessions, scrypt password hashes, login throttling records and optional password-reset email.

### Learner profile
Grade/status, province, school, marks and SchoolCore link.

### Discovery assessment
24 learner-friendly questions. The six dimensions are Build, Analyse, Create, Help, Lead and Organise. They are guidance dimensions, not diagnoses or fixed personality labels.

### Matching engine
Deterministic vector-distance matching between assessment dimensions and career trait profiles. This remains operational with no AI key.

### AI layer
AI is an explanatory layer, not the source of institutional truth. It is used for:
- learner-friendly career-coach explanations
- school-report extraction

Institution/provider facts and application links remain database-grounded.

### Verification layer
Institution records carry verification source and status. A search miss returns “needs verification”, never “scam”.

### Data operations
Admin imports let the operational team refresh registries without redeploying the app.

### SchoolCore hand-off
Signed HMAC payloads can create/link a LifePath learner and synchronise marks.

## Scaling

LifePath has its own repository and database so it can serve users outside SchoolCore. SchoolCore is an integration client, not a runtime dependency.

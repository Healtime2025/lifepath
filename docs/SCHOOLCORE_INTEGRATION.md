# SchoolCore ↔ LifePath integration

LifePath is independent, but a SchoolCore learner can enter LifePath without retyping school data.

## Endpoint

`POST /api/schoolcore/handoff`

Set the same strong secret in both applications:

```text
SCHOOLCORE_SHARED_SECRET=...
```

## Browser hand-off

SchoolCore builds this JSON payload:

```json
{
  "timestamp": 1790300000000,
  "learnerId": "schoolcore-learner-id",
  "schoolId": "schoolcore-school-id",
  "email": "learner@example.com",
  "firstName": "Learner",
  "lastName": "Surname",
  "grade": "Grade 11",
  "province": "Mpumalanga",
  "schoolName": "School name",
  "marks": [
    {"subject":"Mathematics","mark":72,"grade":"Grade 11","period":"Term 3"}
  ]
}
```

1. UTF-8 encode the JSON.
2. Base64url encode it to `payload`.
3. Calculate hex `HMAC-SHA256(payload, SCHOOLCORE_SHARED_SECRET)` as `signature`.
4. Submit a form POST from the learner's browser to LifePath with `payload` and `signature` fields.

LifePath rejects hand-offs older than 5 minutes. It creates/links the account, synchronises marks as `source=schoolcore`, starts a LifePath session and redirects to `/dashboard`.

## Security

- Use HTTPS only.
- Rotate the shared secret if exposed.
- Do not place raw learner marks or email in a query string.
- Keep SchoolCore and LifePath audit logs.

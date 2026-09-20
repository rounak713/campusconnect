# Student Verification

Two verification paths, both low-cost and low-overhead:

- **Method A — college email domain (zero cost).** A whitelisted `.ac.in` / `.edu.in` address receives a 6-digit OTP; a correct entry auto-grants `VERIFIED`.
- **Method B — manual ID review.** Students without a college email upload an ID card photo to private object storage; an admin approves or rejects it and the student is emailed the outcome.

## Data model (`prisma/schema.prisma`, mirrored in `schema.postgresql.prisma`)

| Model | Purpose |
| --- | --- |
| `CollegeDomain` | Whitelist of approved college email domains, optionally linked to a `College`. |
| `EmailOtp` | Hashed OTPs (`HMAC-SHA256(OTP_PEPPER, email::code)`), TTL, attempt counter, consumption timestamp. |
| `VerificationRequest` | ID-card submissions: storage provider + key, MIME/size, review status, reviewer, reason. |
| `User` | Adds `verificationMethod`, `verifiedAt`, `contactEmail`, `isAdmin`; `verificationStatus` now also uses `PENDING_REVIEW` / `REJECTED`. |

## Student endpoints

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/verification/domains` | Public: whitelisted domains + accepted academic suffixes. |
| `GET` | `/api/verification/status` | Current status and the latest review request. |
| `POST` | `/api/verification/email/request-otp` | Body `{ email }`. Rejects non-college domains and emails already bound to another account. 60s resend cooldown, 5 req/min. |
| `POST` | `/api/verification/email/verify-otp` | Body `{ email, otp }`. 10-minute TTL, max 5 attempts, single use, timing-safe compare. |
| `POST` | `/api/verification/id-card` | `multipart/form-data` with `idCard` (JPEG/PNG/WebP/HEIC, ≤5 MB) and optional `contactEmail`. 3 uploads/hour; one pending review at a time. |

## Admin endpoints

Authenticated as a `User` with `isAdmin = true`, or service-to-service with the `X-Admin-Key` header (`ADMIN_API_KEY`).

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/admin/verifications/pending` | Paginated queue (`limit`, `offset`) with short-lived signed image URLs. |
| `POST` | `/api/admin/verifications/action` | Body `{ userId, status: "APPROVED" \| "REJECTED", reason?, requestId? }`. `reason` is mandatory when rejecting. Emails the student. |
| `GET` | `/api/admin/verifications/user/:userId` | Review history / audit trail. |

## Providers

Both integrations degrade to a free local mode so the flow runs end-to-end without any paid account:

- Email: `SENDGRID_API_KEY` → SendGrid SMTP; else `SMTP_HOST` → generic SMTP; else console transport.
- ID storage: `S3_BUCKET` → S3 (private ACL, AES256, presigned GETs); else `CLOUDINARY_CLOUD_NAME` → Cloudinary `authenticated` type with signed URLs; else local disk at `LOCAL_ID_STORAGE_DIR` (mode 0600).

See `.env.example` for the full variable list.

## Running

```bash
npm install
npx prisma db push      # or: npx prisma migrate dev
npm run seed            # colleges, domain whitelist, demo students, admin reviewer
npm run dev
npm run test:verification
```

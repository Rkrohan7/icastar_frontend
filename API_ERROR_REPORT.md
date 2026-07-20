# iCastar — Full Project API Error Report & cURL Documentation

**Tested on:** 2026-07-20
**Backend base URL:** `https://api.icastar.com/api`
**Frontend:** Vite dev server → `http://localhost:5173/` (ran successfully with `npm run dev`)
**Method:** Every endpoint referenced in `services/`, `pages/`, `hooks/`, `components/` was extracted and hit live against the production backend. Two fresh accounts were created (one `ARTIST`, one `RECRUITER`) to obtain real JWTs, and each endpoint was probed by role.

---

## 0. TL;DR — 4 things are broken

| # | Severity | What | Where |
|---|----------|------|-------|
| 1 | 🔴 **BLOCKER (backend)** | `EL1004E: Method isPresent() cannot be found on type ...entity.User` — a SpEL/`Optional` bug on the backend breaks **nearly every authenticated Artist & Recruiter endpoint** (dashboard, auditions, jobs, bookmarks, notifications, profile). | Backend Java code |
| 2 | 🔴 **SECURITY (backend)** | **Broken access control** — every `/super-admin/*` endpoint is reachable with an ordinary **ARTIST or RECRUITER** token. Any user can read all users, recruiters, and platform config. No role check. | Backend security config |
| 3 | 🟠 **BUG (frontend)** | Double `/api` — `onboardingService.ts` calls `/api/artist/...` while the axios baseURL already ends in `/api`, so requests go to `https://api.icastar.com/api/api/...` → 500. Breaks onboarding skills/languages/upload. | `services/onboardingService.ts` |
| 4 | 🟡 **VALIDATION mismatch** | Some frontend payloads miss required fields the backend now demands (`confirmPassword` on change-password, `fileUrl`/fields on uploads). | multiple services |

**Status code distribution across 56 probed endpoints:** `200 → 13`, `400 → 34`, `401 → 1`, `500 → 8`.

The frontend itself compiles and runs fine. The failures are almost entirely **server-side**.

---

## 1. Auth flow (Register → Sign in) ✅ WORKS

These are the only flows that work end-to-end.

### Register — `POST /auth/register` → **200 OK**
```bash
curl -X POST 'https://api.icastar.com/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Test@1234","firstName":"John","lastName":"Doe","mobile":"9876543210","role":"ARTIST"}'
```
- ✅ `200` → `{"data":{"email":...,"id":119,"role":"ARTIST","status":"ACTIVE","isVerified":true},"success":true}`
- ⚠️ `400` `{"success":false,"message":"User already exists with this email or mobile"}` — duplicate email **or** mobile.
- ⚠️ Note: `mobile` must be unique. Two registrations sharing a mobile → 400.

### Login — `POST /auth/login` → **200 OK**
```bash
curl -X POST 'https://api.icastar.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Test@1234"}'
```
- ✅ `200` → returns `data.token` (JWT, ~24h expiry).
- ⚠️ `400` VALIDATION_ERROR if `password` < 6 chars or fields missing:
  `{"error":{"code":"VALIDATION_ERROR","details":{"password":"Password must be at least 6 characters"}}}`
- ⚠️ `400` `{"message":"Login failed","error":"Invalid email or password"}` on wrong credentials.

### Current user — `GET /auth/me` → **200 OK**
```bash
curl 'https://api.icastar.com/api/auth/me' -H 'Authorization: Bearer <TOKEN>'
```
- ✅ `200` with token. `401 UNAUTHORIZED` without token ("Full authentication is required").

### Public artist types — `GET /public/artist-types` → **200 OK**
```bash
curl 'https://api.icastar.com/api/public/artist-types'
```
- ✅ `200` → array of artist types (ACTOR, DANCER, …). Used by onboarding category picker. No auth needed.

---

## 2. 🔴 The `isPresent()` backend bug — breaks the whole app after login

**Every** authenticated business endpoint (Artist + Recruiter) returns:
```json
{"success":false,"message":"... EL1004E: Method call: Method isPresent() cannot be found on type com.icastar.platform.entity.User"}
```
This is a Spring Expression Language error — backend code is calling `.isPresent()` on a `User` entity instead of an `Optional<User>` (likely in a `@PreAuthorize`/service lookup). **This is not a frontend bug** — the requests, tokens and payloads are correct. Until the backend is fixed, the Artist and Recruiter dashboards cannot load data.

### Affected — Artist onboarding & profile
| Method | Endpoint | Status | Note |
|--------|----------|--------|------|
| GET | `/artists/profile/complete` | **400** | `isPresent()` bug |
| GET | `/artist-profiles/complete` | **400** | `isPresent()` bug |
| GET | `/artist/profile/completion` | **500** | `isPresent()` bug |
| POST | `/artists/profile` | **400** | `isPresent()` bug (onboarding submit) |
| PUT | `/artists/profile` | **400** | VALIDATION — requires `firstName`, `lastName` |

```bash
curl 'https://api.icastar.com/api/artists/profile/complete' -H 'Authorization: Bearer <ARTIST_TOKEN>'
# -> 400  isPresent() bug
```

### Affected — Artist dashboard (all 7 → **400**)
`/artist/dashboard/metrics`, `/application-status`, `/earnings-trend`, `/job-opportunities`, `/portfolio`, `/profile-views-trend`, `/recent-activity`
```bash
curl 'https://api.icastar.com/api/artist/dashboard/metrics' -H 'Authorization: Bearer <ARTIST_TOKEN>'
# -> 400  {"success":false,"message":"EL1004E: Method call: Method isPresent() ..."}
```

### Affected — Artist auditions (all → **400**)
`/artist/auditions`, `/artist/auditions/upcoming`, `/artist/auditions/past`, `/artist/auditions/stats`, `/artist/auditions/open`
```bash
curl 'https://api.icastar.com/api/artist/auditions' -H 'Authorization: Bearer <ARTIST_TOKEN>'
# -> 400  isPresent() bug
```

### Affected — Jobs / Applications / Bookmarks / Notifications
| Method | Endpoint | Status | Note |
|--------|----------|--------|------|
| GET | `/jobs` | **400** | `isPresent()` bug |
| GET | `/my-applications` | **400** | `isPresent()` bug |
| GET | `/bookmarks` | **400** | `isPresent()` bug |
| GET | `/bookmarks/with-notes` | **400** | `isPresent()` bug |
| GET | `/notifications` | **400** | `isPresent()` bug |
| GET | `/notifications/unread-count` | **500** | `{"message":"Failed to fetch unread count"}` |

### Affected — Recruiter dashboard / jobs / auditions
| Method | Endpoint | Status | Note |
|--------|----------|--------|------|
| GET | `/recruiter/dashboard/profile` | ✅ **200** | works |
| GET | `/recruiter/dashboard/metrics` | **400** | `isPresent()` bug |
| GET | `/recruiter/dashboard/latest-applicants` | **400** | `isPresent()` bug |
| GET | `/recruiter/dashboard/hires` | **400** | `isPresent()` bug |
| GET | `/recruiter/dashboard/application-status` | **400** | `isPresent()` bug |
| GET | `/recruiter/dashboard/applications-trend` | **400** | `isPresent()` bug |
| GET | `/recruiter/dashboard/interview-outcomes` | **400** | `isPresent()` bug |
| GET | `/recruiter/jobs` | **500** | `isPresent()` bug (RUNTIME_ERROR) |
| GET | `/recruiter/jobs/stats` | **500** | `isPresent()` bug (RUNTIME_ERROR) |
| POST | `/recruiter/jobs` | **400** | VALIDATION — needs `experienceLevel`, `jobType`, … |
| GET | `/recruiter/auditions` | **400** | `isPresent()` bug |
| GET | `/recruiter/auditions/stats` | **400** | `isPresent()` bug |
| POST | `/recruiter/auditions` | **400** | `isPresent()` bug |
| GET | `/recruiter/open-auditions` | **500** | `{"message":"An unexpected error occurred"}` |

```bash
curl 'https://api.icastar.com/api/recruiter/dashboard/metrics' -H 'Authorization: Bearer <RECRUITER_TOKEN>'
# -> 400  isPresent() bug
curl 'https://api.icastar.com/api/recruiter/jobs' -H 'Authorization: Bearer <RECRUITER_TOKEN>'
# -> 500  isPresent() bug
```

---

## 3. 🔴 SECURITY — `/super-admin/*` has no role check

Any authenticated user (even a brand-new ARTIST) can call every super-admin endpoint. Only a missing token is rejected (401); role is never verified.

| Token | `GET /super-admin/dashboard` | `GET /super-admin/config` |
|-------|------------------------------|---------------------------|
| No token | `401` ✅ | `401` ✅ |
| **ARTIST** | **`200` 🔴** | **`200` 🔴** |
| **RECRUITER** | **`200` 🔴** | **`200` 🔴** |

```bash
# This should be 403 but returns 200 with an ARTIST token:
curl 'https://api.icastar.com/api/super-admin/dashboard' -H 'Authorization: Bearer <ARTIST_TOKEN>'
# -> 200  {"data":{"totalUsers":120,"totalArtists":92,"totalRecruiters":26,...}}

curl 'https://api.icastar.com/api/super-admin/config' -H 'Authorization: Bearer <ARTIST_TOKEN>'
# -> 200  platform config (emails, settings) leaked to non-admins
```
**Fix required on backend:** enforce `SUPER_ADMIN` role on all `/super-admin/**` routes.

### Super-admin endpoints (all return 200 with any token today)
`GET /super-admin/dashboard` · `/dashboard/summary` · `/artists` · `/recruiters` · `/jobs` · `/categories` · `/skills` · `/config` · `/stats/users` — **all `200`**.
`GET /super-admin/reports/overview` → **500** (`INTERNAL_SERVER_ERROR`).

```bash
curl 'https://api.icastar.com/api/super-admin/artists' -H 'Authorization: Bearer <TOKEN>'      # 200
curl 'https://api.icastar.com/api/super-admin/reports/overview' -H 'Authorization: Bearer <TOKEN>' # 500
```

---

## 4. 🟠 Frontend bug — double `/api` in `onboardingService.ts`

`apiClient` baseURL is `https://api.icastar.com/api`, but these calls prepend another `/api`:

| File / line | Call | Resulting URL | Status |
|-------------|------|---------------|--------|
| `services/onboardingService.ts:40` | `POST /api/artist/onboard` | `.../api/api/artist/onboard` | broken |
| `services/onboardingService.ts:104` | `GET /api/artist/skills` | `.../api/api/artist/skills` | **500** |
| `services/onboardingService.ts:114` | `GET /api/artist/languages` | `.../api/api/artist/languages` | **500** |
| `services/onboardingService.ts:131` | `POST /api/upload` | `.../api/api/upload` | broken |

**Fix (frontend):** drop the leading `/api` in those four calls (e.g. `/artist/skills`, `/upload`). The correct upload endpoints already used elsewhere are `/upload/presigned-url`, `/upload/confirm`, `/upload/artist-profile-photo`, etc. in `services/uploadService.ts`.

---

## 5. 🟡 Validation mismatches (payload shape)

| Endpoint | Status | Server wants | Frontend sends |
|----------|--------|--------------|----------------|
| `POST /users/change-password` | **400** | also requires `confirmPassword` | check `SettingsPage.tsx` payload includes it |
| `POST /upload/presigned-url` | **400** | required fields validation | `{fileName,fileType}` insufficient |
| `POST /upload/confirm` | **400** | `fileUrl is required` | sends `{key:...}` |
| `PUT /artists/profile` | **400** | `firstName`, `lastName` required | partial update omits them |
| `POST /recruiter/jobs` | **400** | `experienceLevel`, `jobType`, … required | minimal payload |

```bash
curl -X POST 'https://api.icastar.com/api/users/change-password' \
  -H 'Authorization: Bearer <TOKEN>' -H 'Content-Type: application/json' \
  -d '{"currentPassword":"Test@1234","newPassword":"Test@12345"}'
# -> 400  {"error":{"code":"VALIDATION_ERROR","details":{"confirmPassword":"Confirm password is required"}}}
```

---

## 6. Complete cURL reference (by flow)

Replace `<TOKEN>` with the JWT from `/auth/login`. Statuses reflect the 2026-07-20 live test.

```bash
BASE='https://api.icastar.com/api'

# ---- AUTH (WORKS) ----
curl -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"u@x.com","password":"Test@1234","firstName":"J","lastName":"D","mobile":"9876543210","role":"ARTIST"}'   # 200
curl -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"u@x.com","password":"Test@1234"}'                                                                        # 200
curl $BASE/auth/me -H "Authorization: Bearer <TOKEN>"                                                                    # 200
curl $BASE/public/artist-types                                                                                           # 200

# ---- ARTIST ONBOARDING / PROFILE ----
curl $BASE/artists/profile/complete   -H "Authorization: Bearer <TOKEN>"     # 400 isPresent bug
curl $BASE/artist-profiles/complete   -H "Authorization: Bearer <TOKEN>"     # 400 isPresent bug
curl $BASE/artist/profile/completion  -H "Authorization: Bearer <TOKEN>"     # 500 isPresent bug
curl -X POST $BASE/artists/profile -H "Authorization: Bearer <TOKEN>" -H 'Content-Type: application/json' -d '{...}'  # 400
curl -X PUT  $BASE/artists/profile -H "Authorization: Bearer <TOKEN>" -H 'Content-Type: application/json' -d '{"firstName":"J","lastName":"D",...}'  # 400

# ---- ARTIST DASHBOARD (all 400) ----
for p in metrics application-status earnings-trend job-opportunities portfolio profile-views-trend recent-activity; do
  curl $BASE/artist/dashboard/$p -H "Authorization: Bearer <TOKEN>"; done   # 400 each

# ---- ARTIST AUDITIONS (all 400) ----
curl $BASE/artist/auditions          -H "Authorization: Bearer <TOKEN>"     # 400
curl $BASE/artist/auditions/upcoming -H "Authorization: Bearer <TOKEN>"     # 400
curl $BASE/artist/auditions/past     -H "Authorization: Bearer <TOKEN>"     # 400
curl $BASE/artist/auditions/stats    -H "Authorization: Bearer <TOKEN>"     # 400
curl $BASE/artist/auditions/open     -H "Authorization: Bearer <TOKEN>"     # 400

# ---- JOBS / APPLICATIONS / BOOKMARKS / NOTIFICATIONS ----
curl $BASE/jobs                       -H "Authorization: Bearer <TOKEN>"    # 400
curl $BASE/my-applications            -H "Authorization: Bearer <TOKEN>"    # 400
curl $BASE/bookmarks                  -H "Authorization: Bearer <TOKEN>"    # 400
curl $BASE/bookmarks/with-notes       -H "Authorization: Bearer <TOKEN>"    # 400
curl $BASE/notifications              -H "Authorization: Bearer <TOKEN>"    # 400
curl $BASE/notifications/unread-count -H "Authorization: Bearer <TOKEN>"    # 500

# ---- RECRUITER ----
curl $BASE/recruiter/dashboard/profile           -H "Authorization: Bearer <TOKEN>"  # 200 (only one that works)
curl $BASE/recruiter/dashboard/metrics           -H "Authorization: Bearer <TOKEN>"  # 400
curl $BASE/recruiter/dashboard/latest-applicants -H "Authorization: Bearer <TOKEN>"  # 400
curl $BASE/recruiter/dashboard/hires             -H "Authorization: Bearer <TOKEN>"  # 400
curl $BASE/recruiter/jobs                        -H "Authorization: Bearer <TOKEN>"  # 500
curl $BASE/recruiter/jobs/stats                  -H "Authorization: Bearer <TOKEN>"  # 500
curl $BASE/recruiter/auditions                   -H "Authorization: Bearer <TOKEN>"  # 400
curl $BASE/recruiter/auditions/stats             -H "Authorization: Bearer <TOKEN>"  # 400
curl $BASE/recruiter/open-auditions              -H "Authorization: Bearer <TOKEN>"  # 500

# ---- SUPER-ADMIN (200 with ANY token — security bug) ----
curl $BASE/super-admin/dashboard          -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/dashboard/summary  -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/artists            -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/recruiters         -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/jobs               -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/categories         -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/skills             -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/config             -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/stats/users        -H "Authorization: Bearer <TOKEN>"  # 200
curl $BASE/super-admin/reports/overview   -H "Authorization: Bearer <TOKEN>"  # 500
```

---

## 7. Recommended fix order

1. **Backend — fix `isPresent()` SpEL bug** (unblocks ~40 endpoints; the whole Artist/Recruiter app depends on it).
2. **Backend — enforce `SUPER_ADMIN` role** on `/super-admin/**` (security).
3. **Backend — fix 500s**: `/notifications/unread-count`, `/recruiter/open-auditions`, `/super-admin/reports/overview`.
4. **Frontend — remove double `/api`** in `services/onboardingService.ts` (lines 40, 104, 114, 131).
5. **Frontend — align payloads**: add `confirmPassword` to change-password; send `fileUrl` + required fields to upload endpoints; include `firstName`/`lastName` on profile PUT.

> Frontend runs correctly (`npm run dev` → localhost:5173). The blocking failures are on the backend.

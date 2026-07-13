# Admin Panel — Complete API Specification

Base URL: `https://api.icastar.com/api`
All endpoints require: `Authorization: Bearer <jwt>` with role `ADMIN`.

Standard response envelope:
```json
{ "success": true, "message": "...", "data": ... }
```
Paginated:
```json
{ "success": true, "data": [ ... ], "currentPage": 0, "totalItems": 0, "totalPages": 0 }
```
Error:
```json
{ "success": false, "message": "Reason", "error": "Details" }
```

---

## ✅ Already implemented (reference)

These exist and the UI is wired up:

| Endpoint | Purpose |
|---|---|
| `GET /super-admin/dashboard` | Dashboard summary |
| `GET /super-admin/dashboard/summary` | Lightweight dashboard |
| `GET /super-admin/recruiters` | List recruiters (paged) |
| `GET /super-admin/recruiters/{id}` | Recruiter detail |
| `GET /super-admin/artists` | List artists (paged) |
| `GET /super-admin/artists/{id}` | Artist detail |
| `GET /super-admin/jobs` | List jobs (paged) |
| `GET /super-admin/reports/users` | User report (date range) |
| `GET /super-admin/reports/jobs` | Job report (date range) |
| `GET /super-admin/reports/overview` | Combined overview report |
| `GET /super-admin/stats/users` | User stats |
| `GET /super-admin/stats/jobs` | Job stats |
| `GET /super-admin/stats/applications` | Application stats |
| `GET /super-admin/stats/distribution` | Type distribution |
| `GET /super-admin/config` | Read system config |
| `PUT /super-admin/config` | Update config key |

---

## 🟡 Pending — needed for the rest of the admin panel

Below are the menu sections currently showing "Coming Soon" in the UI, with the endpoints + responses needed to bring each online.

---

### 1. ADMIN USERS

Manage other admin/staff accounts.

#### `GET /super-admin/admins`
Query: `page`, `size`, `sortBy`, `sortDir`, `search`, `status`
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "firstName": "Ankit",
      "lastName": "Verma",
      "email": "ankit@icastar.com",
      "mobile": "+919876500000",
      "role": "SUPER_ADMIN",
      "permissions": ["MANAGE_USERS", "MANAGE_JOBS", "MANAGE_CONFIG"],
      "accountStatus": "ACTIVE",
      "lastLoginAt": "2026-05-29T09:00:00",
      "createdAt": "2025-01-15T08:00:00",
      "createdBy": "rohan@icastar.com"
    }
  ],
  "currentPage": 0, "totalItems": 12, "totalPages": 1
}
```

#### `POST /super-admin/admins`
Body: `{ firstName, lastName, email, mobile, role, permissions[] }` → returns created admin.

#### `PUT /super-admin/admins/{id}` → update admin
#### `PATCH /super-admin/admins/{id}/status` body: `{ status }`
#### `DELETE /super-admin/admins/{id}`

---

### 2. JOB APPROVALS

Recruiter-posted jobs awaiting review.

#### `GET /super-admin/jobs/pending-approval`
Query: `page`, `size`, `recruiterId`
```json
{
  "success": true,
  "data": [
    {
      "id": 201,
      "title": "Lead Dancer",
      "description": "...",
      "recruiter": { "id": 101, "name": "Rajesh Kumar", "companyName": "Star Productions" },
      "submittedAt": "2026-05-28T10:00:00",
      "flags": ["INCOMPLETE_REQUIREMENTS"],
      "previousRejections": 0
    }
  ],
  "currentPage": 0, "totalItems": 8, "totalPages": 1
}
```

#### `POST /super-admin/jobs/{id}/approve` body: `{ reviewerNote }`
#### `POST /super-admin/jobs/{id}/reject` body: `{ reason, reviewerNote }`

Response:
```json
{ "success": true, "message": "Job approved", "data": { "id": 201, "status": "ACTIVE" } }
```

---

### 3. JOB CATEGORIES

#### `GET /super-admin/categories/jobs`
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "Acting", "slug": "acting",
      "description": "Film, TV, theatre",
      "iconUrl": "https://...",
      "jobCount": 145,
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

#### `POST /super-admin/categories/jobs` body: `{ name, description, iconUrl, displayOrder }`
#### `PUT /super-admin/categories/jobs/{id}`
#### `DELETE /super-admin/categories/jobs/{id}`
#### `PATCH /super-admin/categories/jobs/{id}/toggle` toggle active flag

---

### 4. ALL AUDITIONS

#### `GET /super-admin/auditions`
Query: `page`, `size`, `sortBy`, `sortDir`, `search`, `status`, `auditionMode`, `recruiterId`
```json
{
  "success": true,
  "data": [
    {
      "id": 301,
      "title": "Lead Role - Action Thriller",
      "description": "...",
      "projectTitle": "Project Phoenix",
      "projectType": "FEATURE_FILM",
      "roleType": "LEAD",
      "characterName": "Detective Rao",
      "auditionMode": "IN_PERSON",
      "location": "Mumbai",
      "auditionDate": "2026-06-15",
      "submissionDeadline": "2026-06-10",
      "status": "ACTIVE",
      "budgetMin": 500000, "budgetMax": 1500000, "currency": "INR",
      "applicationsCount": 89,
      "viewsCount": 1240,
      "recruiter": { "id": 101, "name": "Rajesh Kumar", "companyName": "Star Productions" },
      "createdAt": "2026-05-20T10:00:00"
    }
  ],
  "currentPage": 0, "totalItems": 287, "totalPages": 15
}
```

#### `GET /super-admin/auditions/{id}` — full detail

---

### 5. AUDITION APPROVALS

#### `GET /super-admin/auditions/pending-approval`
Same shape as Job Approvals but with audition fields.

#### `POST /super-admin/auditions/{id}/approve`
#### `POST /super-admin/auditions/{id}/reject` body: `{ reason, reviewerNote }`

---

### 6. JOB APPLICATIONS

#### `GET /super-admin/applications/jobs`
Query: `page`, `size`, `status`, `jobId`, `artistId`, `recruiterId`, `appliedAfter`, `appliedBefore`
```json
{
  "success": true,
  "data": [
    {
      "id": 501,
      "job": { "id": 1, "title": "Lead Actor", "recruiterName": "Rajesh Kumar" },
      "artist": { "id": 1, "name": "Priya Sharma", "artistType": "Actor", "profileImage": "https://..." },
      "status": "SHORTLISTED",
      "coverLetter": "I am excited...",
      "expectedSalary": 750000,
      "appliedAt": "2026-05-25T14:30:00",
      "lastStatusChangeAt": "2026-05-27T11:00:00",
      "interviewScheduledAt": null
    }
  ],
  "currentPage": 0, "totalItems": 3500, "totalPages": 175
}
```

#### `GET /super-admin/applications/jobs/{id}` — detail

---

### 7. AUDITION APPLICATIONS

#### `GET /super-admin/applications/auditions`
Same structure as job applications but with `audition` instead of `job` and audition-specific fields:
- `submissionVideoUrl`, `selfTapeUrl`, `headshotUrl`, `selectedDate`, `selectedSlot`

---

### 8. INTERVIEWS

#### `GET /super-admin/interviews`
Query: `page`, `size`, `status`, `scheduledAfter`, `scheduledBefore`, `recruiterId`, `artistId`
```json
{
  "success": true,
  "data": [
    {
      "id": 701,
      "applicationId": 501,
      "job": { "id": 1, "title": "Lead Actor" },
      "recruiter": { "id": 101, "name": "Rajesh Kumar" },
      "artist": { "id": 1, "name": "Priya Sharma" },
      "interviewType": "VIDEO_CALL",
      "scheduledAt": "2026-06-02T15:00:00",
      "durationMinutes": 30,
      "meetingLink": "https://meet.google.com/...",
      "location": null,
      "status": "SCHEDULED",
      "createdAt": "2026-05-28T09:00:00"
    }
  ],
  "currentPage": 0, "totalItems": 127, "totalPages": 7
}
```

#### `GET /super-admin/interviews/stats` → counts by status

---

### 9. ARTIST PORTFOLIOS (moderation)

#### `GET /super-admin/portfolios`
Query: `page`, `size`, `artistId`, `mediaType`, `flagged`
```json
{
  "success": true,
  "data": [
    {
      "id": 901,
      "artist": { "id": 1, "name": "Priya Sharma", "artistType": "Actor" },
      "mediaType": "IMAGE",
      "url": "https://s3.amazonaws.com/...",
      "thumbnailUrl": "https://...",
      "caption": "Shoot from 'Mumbai Nights'",
      "uploadedAt": "2026-05-20T10:00:00",
      "isFlagged": false,
      "flagCount": 0,
      "isApproved": true,
      "viewCount": 245
    }
  ],
  "currentPage": 0, "totalItems": 1820, "totalPages": 92
}
```

#### `POST /super-admin/portfolios/{id}/approve`
#### `POST /super-admin/portfolios/{id}/remove` body: `{ reason }`

---

### 10. REPORTED CONTENT

#### `GET /super-admin/reports/content`
Query: `page`, `size`, `status`, `contentType`, `severity`
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "contentType": "PORTFOLIO_IMAGE",
      "contentId": 901,
      "contentPreview": { "url": "https://...", "ownerName": "..." },
      "reportedBy": { "id": 5, "name": "John Doe", "role": "RECRUITER" },
      "reason": "INAPPROPRIATE",
      "description": "Contains nudity",
      "severity": "HIGH",
      "status": "PENDING",
      "reportedAt": "2026-05-28T14:00:00",
      "reviewedAt": null,
      "reviewerNote": null,
      "actionTaken": null
    }
  ],
  "currentPage": 0, "totalItems": 23, "totalPages": 2
}
```

#### `POST /super-admin/reports/content/{id}/resolve`
Body: `{ action: "DISMISS" | "REMOVE_CONTENT" | "WARN_USER" | "SUSPEND_USER", note }`

---

### 11. PAYMENTS — TRANSACTIONS

#### `GET /super-admin/payments/transactions`
Query: `page`, `size`, `status`, `type`, `userId`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_123",
      "type": "SUBSCRIPTION",
      "user": { "id": 101, "name": "Rajesh Kumar", "role": "RECRUITER" },
      "amount": 9999,
      "currency": "INR",
      "status": "SUCCESS",
      "paymentMethod": "UPI",
      "gateway": "razorpay",
      "gatewayTransactionId": "pay_abcd1234",
      "description": "Premium subscription - monthly",
      "createdAt": "2026-05-28T10:00:00",
      "completedAt": "2026-05-28T10:00:05"
    }
  ],
  "currentPage": 0, "totalItems": 1245, "totalPages": 63
}
```

#### `GET /super-admin/payments/transactions/{id}` — detail
#### `POST /super-admin/payments/transactions/{id}/refund` body: `{ amount, reason }`

---

### 12. PAYMENTS — CREDITS USAGE

#### `GET /super-admin/credits/summary`
```json
{
  "success": true,
  "data": {
    "totalCreditsIssued": 50000,
    "totalCreditsUsed": 32450,
    "totalCreditsExpired": 1200,
    "activeBalance": 16350,
    "creditsByPlan": { "FREE": 10000, "PREMIUM": 35000, "ENTERPRISE": 5000 }
  }
}
```

#### `GET /super-admin/credits/usage`
Query: `page`, `size`, `userId`, `action`, `dateFrom`, `dateTo`
```json
{
  "success": true,
  "data": [
    {
      "id": 5001,
      "user": { "id": 101, "name": "Rajesh Kumar", "role": "RECRUITER" },
      "action": "POST_JOB",
      "creditsUsed": 5,
      "balanceBefore": 100,
      "balanceAfter": 95,
      "referenceType": "JOB",
      "referenceId": 201,
      "createdAt": "2026-05-28T10:00:00"
    }
  ],
  "currentPage": 0, "totalItems": 850, "totalPages": 43
}
```

---

### 13. PAYMENTS — PAYOUTS

Money paid out to recruiters / hires.

#### `GET /super-admin/payouts`
Query: `page`, `size`, `status`, `userId`, `dateFrom`, `dateTo`
```json
{
  "success": true,
  "data": [
    {
      "id": "pay_456",
      "user": { "id": 1, "name": "Priya Sharma", "role": "ARTIST" },
      "amount": 50000,
      "currency": "INR",
      "status": "PENDING",
      "method": "BANK_TRANSFER",
      "accountLast4": "4567",
      "ifsc": "HDFC0001234",
      "requestedAt": "2026-05-25T12:00:00",
      "processedAt": null,
      "notes": null
    }
  ],
  "currentPage": 0, "totalItems": 45, "totalPages": 3
}
```

#### `POST /super-admin/payouts/{id}/approve`
#### `POST /super-admin/payouts/{id}/reject` body: `{ reason }`
#### `POST /super-admin/payouts/{id}/mark-paid` body: `{ utrNumber, paidAt }`

---

### 14. SETTINGS — ROLES & PERMISSIONS

#### `GET /super-admin/roles`
```json
{
  "success": true,
  "data": [
    {
      "id": 1, "name": "SUPER_ADMIN", "label": "Super Admin",
      "description": "Full access",
      "permissions": ["*"],
      "userCount": 2,
      "isSystem": true
    },
    {
      "id": 2, "name": "MODERATOR", "label": "Moderator",
      "permissions": ["MODERATE_CONTENT", "MODERATE_PROFILES"],
      "userCount": 5,
      "isSystem": false
    }
  ]
}
```

#### `GET /super-admin/permissions` — list all available permission keys grouped by module
```json
{
  "success": true,
  "data": {
    "users": ["VIEW_USERS", "MANAGE_USERS", "SUSPEND_USERS"],
    "jobs": ["VIEW_JOBS", "APPROVE_JOBS", "DELETE_JOBS"],
    "auditions": ["VIEW_AUDITIONS", "APPROVE_AUDITIONS"],
    "content": ["MODERATE_PORTFOLIOS", "RESOLVE_REPORTS"],
    "payments": ["VIEW_TRANSACTIONS", "PROCESS_REFUNDS", "PROCESS_PAYOUTS"],
    "config": ["VIEW_CONFIG", "EDIT_CONFIG"]
  }
}
```

#### `POST /super-admin/roles` body: `{ name, label, description, permissions[] }`
#### `PUT /super-admin/roles/{id}` body: `{ label, description, permissions[] }`
#### `DELETE /super-admin/roles/{id}` (only if `isSystem === false`)

---

### 15. SETTINGS — CATEGORIES & SKILLS

#### `GET /super-admin/skills`
Query: `page`, `size`, `search`, `category`
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Method Acting", "category": "Acting", "usageCount": 245, "isActive": true },
    { "id": 2, "name": "Classical Dance", "category": "Dance", "usageCount": 120, "isActive": true }
  ],
  "currentPage": 0, "totalItems": 156, "totalPages": 8
}
```

#### `POST /super-admin/skills` body: `{ name, category }`
#### `PUT /super-admin/skills/{id}`
#### `DELETE /super-admin/skills/{id}`

#### `GET /super-admin/artist-types` — list of artist categories
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Actor", "userCount": 320, "isActive": true, "displayOrder": 1 },
    { "id": 2, "name": "Dancer", "userCount": 180, "isActive": true, "displayOrder": 2 }
  ]
}
```

#### `POST /super-admin/artist-types`
#### `PUT /super-admin/artist-types/{id}`

---

### 16. USER ACTIONS (across recruiters & artists)

Needed for the existing list pages — currently view-only.

#### `PATCH /super-admin/users/{userId}/status`
Body: `{ status: "ACTIVE" | "SUSPENDED" | "BANNED", reason }`

#### `POST /super-admin/users/{userId}/verify` — mark verified
#### `POST /super-admin/users/{userId}/unverify`
#### `POST /super-admin/users/{userId}/reset-password` — admin-triggered email
#### `POST /super-admin/users/{userId}/impersonate` — returns short-lived token (optional, for debugging)
#### `DELETE /super-admin/users/{userId}` — soft delete with `{ reason }`

Response (status change):
```json
{ "success": true, "message": "User suspended", "data": { "id": 1, "accountStatus": "SUSPENDED" } }
```

---

## Notes for the backend team

1. **Pagination convention:** all paginated list endpoints accept `page` (0-indexed), `size`, `sortBy`, `sortDir` (`ASC`/`DESC`) and return `currentPage`, `totalItems`, `totalPages` siblings to `data`. Spring `Page` (`{ content, totalElements, number, totalPages }`) is also handled by the frontend.

2. **Nullable fields:** the frontend now treats every field as possibly null. Either send `null` or omit — both work. Required fields per endpoint should be documented separately.

3. **Sorting:** advertise the valid `sortBy` field names per endpoint in your API docs (or accept all field names defensively).

4. **Auth header:** `Authorization: Bearer <jwt>` is attached automatically. Role check should reject with `403 { success:false, message:"Admin role required" }`.

5. **Action endpoints:** all `POST`/`PATCH` actions should return the updated resource (or at minimum `{ id, status }`) so the frontend can refresh state without an extra GET.

6. **Date format:** ISO-8601 (`2026-05-29T15:30:00`) everywhere; date-only fields use `YYYY-MM-DD`.

7. **Error responses:** keep the `{ success: false, message, error }` shape consistent; frontend extracts `message` for user display.

8. **Audit logs:** consider an `auditedBy` / `auditedAt` field on all admin write operations (approval, rejection, suspension, etc.) so we can show "who did what" in the UI later.

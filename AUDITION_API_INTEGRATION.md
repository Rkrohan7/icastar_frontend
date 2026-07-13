# Audition/Casting Call API Integration Guide

## Overview
The backend API has been implemented with comprehensive casting call management features. This guide outlines the changes made to integrate the frontend with the actual backend API.

---

## What Was Updated

### 1. Types (`types.ts`)

#### Updated Type Enums
```typescript
// OLD → NEW
AuditionStatus: 'Draft' | 'Open' | 'Closed' → 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'
AuditionRoleType: 'Actor' | 'Singer' | 'Dancer' → 'LEAD' | 'SUPPORTING' | 'BACKGROUND' | 'EXTRA'
AuditionProjectType: 'Movie' | 'TV Show' → 'FEATURE_FILM' | 'TV_SERIES' | 'COMMERCIAL' | 'THEATER' | 'WEB_SERIES' | 'SHORT_FILM' | 'MUSIC_VIDEO'
AuditionMode → AuditionFormat: 'IN_PERSON' | 'VIRTUAL' | 'SELF_TAPE'
AuditionApplicationStatus: 'Applied' | 'Shortlisted' | 'Rejected' | 'Accepted' | 'Withdrawn'
  → 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'CALLBACK_SCHEDULED' | 'CALLBACK_COMPLETED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
```

#### New Interfaces Added
- `AuditionFilters` - For filtering casting calls with search, status, role type, project type, location, urgency, featured status
- `ApplicationFilters` - For filtering applications by status, shortlisted, minimum rating
- `PaginatedResponse<T>` - Standard pagination response wrapper
- `AuditionStats` - Statistics for all casting calls and applications
- `EthnicityPreference` - New enum for ethnicity preferences

#### Updated Audition Interface Fields

**Removed Fields:**
- `languages: string[]` - No longer tracked
- `skills: string[]` - Replaced with `skillsRequired`
- `category: ArtistCategory` - No longer used
- `experienceLevel: ExperienceLevel` - Replaced with `experienceRequired: string`
- `auditionTime: string` - Combined with `auditionDate`
- `submissionDeadline: string` - Renamed to `applicationDeadline`
- `budgetMin/budgetMax/currency` - Replaced with single `compensation: string`
- `visibility/invitedArtistIds/categoryFilter` - Not in backend

**New Fields Added:**
```typescript
// Character Details
characterName?: string
characterDescription?: string

// Project Info
projectTitle?: string
productionCompany?: string
director?: string
castingDirector?: string

// Enhanced Role Requirements
ethnicityPreference?: EthnicityPreference
physicalRequirements?: string
skillsRequired?: string[]
experienceRequired?: string

// Dates
callbackDate?: string
shootingStartDate?: string
shootingEndDate?: string

// Compensation
compensation?: string
compensationType: CompensationType
isUnionProject: boolean

// Application Settings
applicationDeadline: string
requiredDocuments?: string[]
submissionInstructions?: string
allowVideoSubmissions: boolean
requireCoverLetter: boolean

// Contact
contactEmail?: string
contactPhone?: string

// Flags
isUrgent: boolean
isFeatured: boolean
additionalNotes?: string
```

#### Updated Application Interface Fields

**New Fields:**
```typescript
rating?: number // 1-5 star rating
isShortlisted: boolean

// Callback scheduling
callbackDate?: string
callbackLocation?: string
callbackNotes?: string

// Feedback
feedback?: string
rejectionReason?: string
```

---

### 2. Service Layer (`auditionService.ts`)

#### Updated Methods

**getAllAuditions** - Now returns paginated response with filters
```typescript
// OLD
async getAllAuditions(status?: AuditionStatus): Promise<Audition[]>

// NEW
async getAllAuditions(filters?: AuditionFilters): Promise<PaginatedResponse<Audition>>

// Usage
const result = await auditionService.getAllAuditions({
  searchTerm: 'actor',
  status: 'OPEN',
  roleType: 'LEAD',
  projectType: 'FEATURE_FILM',
  isUrgent: true,
  page: 0,
  size: 20
})
console.log(result.data) // Audition[]
console.log(result.totalPages, result.totalElements)
```

**getAuditionApplications** - Now returns paginated response with filters
```typescript
// OLD
async getAuditionApplications(auditionId: number, status?: AuditionApplicationStatus): Promise<AuditionApplication[]>

// NEW
async getAuditionApplications(auditionId: number, filters?: ApplicationFilters): Promise<PaginatedResponse<AuditionApplication>>

// Usage
const result = await auditionService.getAuditionApplications(1, {
  status: 'SHORTLISTED',
  isShortlisted: true,
  minRating: 4,
  page: 0,
  size: 20
})
```

**updateApplicationStatus** - Enhanced with callback scheduling, rating, feedback
```typescript
// OLD
async updateApplicationStatus(
  auditionId: number,
  applicationId: number,
  status: AuditionApplicationStatus,
  notes?: string
): Promise<AuditionApplication>

// NEW
async updateApplicationStatus(
  auditionId: number,
  applicationId: number,
  status: AuditionApplicationStatus,
  options?: {
    notes?: string
    rating?: number
    callbackDate?: string
    callbackLocation?: string
    callbackNotes?: string
    feedback?: string
    rejectionReason?: string
  }
): Promise<AuditionApplication>

// Usage - Schedule callback
await auditionService.updateApplicationStatus(1, 101, 'CALLBACK_SCHEDULED', {
  callbackDate: '2024-02-20T14:00:00',
  callbackLocation: 'Studio A, Los Angeles',
  callbackNotes: 'Please prepare monologue from script pages 5-7',
  rating: 5
})

// Usage - Reject with feedback
await auditionService.updateApplicationStatus(1, 102, 'REJECTED', {
  rejectionReason: 'Not the right fit for this particular role',
  feedback: 'Thank you for your submission'
})
```

**bulkUpdateApplicationStatus** - Enhanced response with success/failure details
```typescript
// OLD
async bulkUpdateApplicationStatus(
  auditionId: number,
  applicationIds: number[],
  status: AuditionApplicationStatus
): Promise<void>

// NEW
async bulkUpdateApplicationStatus(
  auditionId: number,
  applicationIds: number[],
  status: AuditionApplicationStatus,
  options?: {
    notes?: string
    rejectionReason?: string
  }
): Promise<{
  totalRequested: number
  successful: number
  failed: number
  errorMessages: string[]
  successfulIds: number[]
  failedIds: number[]
}>

// Usage
const result = await auditionService.bulkUpdateApplicationStatus(
  1,
  [3, 4, 5, 6],
  'UNDER_REVIEW',
  { notes: 'Moving to review stage' }
)
console.log(`${result.successful} out of ${result.totalRequested} updated successfully`)
if (result.failed > 0) {
  console.log('Errors:', result.errorMessages)
}
```

**getAuditionStats** - Now returns comprehensive statistics
```typescript
// OLD
async getAuditionStats(): Promise<{
  totalAuditions: number
  activeAuditions: number
  draftAuditions: number
  totalApplications: number
}>

// NEW
async getAuditionStats(): Promise<AuditionStats>

// Returns
interface AuditionStats {
  totalCastingCalls: number
  draftCastingCalls: number
  openCastingCalls: number
  closedCastingCalls: number
  totalApplications: number
  appliedApplications: number
  underReviewApplications: number
  shortlistedApplications: number
  selectedApplications: number
  rejectedApplications: number
  selectionRate: number
  avgApplicationsPerCastingCall: number
  recentApplicationsLast30Days: number
}
```

---

## UI Components That Need Updates

### 1. CreateAuditionPage.tsx

#### Form Fields to Update

**Remove:**
- Languages tag input
- Skills tag input (replace with skillsRequired)
- Category dropdown
- Experience level dropdown (replace with experienceRequired text)
- Audit time input (combine with auditionDate)
- Budget min/max/currency (replace with compensation string)
- Visibility settings

**Add:**
```tsx
// Character Details Section
<input name="characterName" placeholder="Character Name" />
<textarea name="characterDescription" placeholder="Character Description" />

// Project Info Section
<input name="projectTitle" placeholder="Project Title" />
<input name="productionCompany" placeholder="Production Company" />
<input name="director" placeholder="Director" />
<input name="castingDirector" placeholder="Casting Director" />

// Role Requirements
<select name="roleType">
  <option value="LEAD">Lead Role</option>
  <option value="SUPPORTING">Supporting Role</option>
  <option value="BACKGROUND">Background</option>
  <option value="EXTRA">Extra</option>
</select>

<select name="ethnicityPreference">
  <option value="ANY">Any</option>
  <option value="CAUCASIAN">Caucasian</option>
  <option value="AFRICAN_AMERICAN">African American</option>
  {/* ... more options */}
</select>

<textarea name="physicalRequirements" placeholder="Physical Requirements" />
<TagInput name="skillsRequired" placeholder="Add skill..." />
<textarea name="experienceRequired" placeholder="Experience Required" />

// Audition Format
<select name="auditionFormat">
  <option value="IN_PERSON">In-Person</option>
  <option value="VIRTUAL">Virtual</option>
  <option value="SELF_TAPE">Self-Tape</option>
</select>

// Dates
<input type="datetime-local" name="auditionDate" />
<input type="datetime-local" name="callbackDate" />
<input type="date" name="shootingStartDate" />
<input type="date" name="shootingEndDate" />

// Compensation
<input name="compensation" placeholder="e.g., SAG Scale + Backend" />
<select name="compensationType">
  <option value="PAID">Paid</option>
  <option value="UNPAID">Unpaid</option>
  <option value="DEFERRED">Deferred</option>
  <option value="COPY_CREDIT_MEALS">Copy, Credit & Meals</option>
</select>
<label>
  <input type="checkbox" name="isUnionProject" />
  Union Project (SAG-AFTRA)
</label>

// Application Settings
<input type="datetime-local" name="applicationDeadline" />
<TagInput name="requiredDocuments" placeholder="Add document..." />
<textarea name="submissionInstructions" />
<label>
  <input type="checkbox" name="allowVideoSubmissions" />
  Allow Video Submissions
</label>
<label>
  <input type="checkbox" name="requireCoverLetter" />
  Require Cover Letter
</label>

// Contact
<input type="email" name="contactEmail" />
<input type="tel" name="contactPhone" />

// Flags
<label>
  <input type="checkbox" name="isUrgent" />
  Mark as Urgent
</label>
<label>
  <input type="checkbox" name="isFeatured" />
  Feature this casting call
</label>

<textarea name="additionalNotes" placeholder="Additional Notes" />
```

#### Update Project Type Options
```tsx
<select name="projectType">
  <option value="FEATURE_FILM">Feature Film</option>
  <option value="TV_SERIES">TV Series</option>
  <option value="COMMERCIAL">Commercial</option>
  <option value="THEATER">Theater</option>
  <option value="WEB_SERIES">Web Series</option>
  <option value="SHORT_FILM">Short Film</option>
  <option value="MUSIC_VIDEO">Music Video</option>
</select>
```

---

### 2. AuditionsListPage.tsx

#### Add Search and Filters
```tsx
const [filters, setFilters] = useState<AuditionFilters>({
  searchTerm: '',
  status: undefined,
  roleType: undefined,
  projectType: undefined,
  isUrgent: undefined,
  isFeatured: undefined,
  page: 0,
  size: 20
})

// Search bar
<input
  type="search"
  placeholder="Search casting calls..."
  value={filters.searchTerm}
  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value, page: 0 })}
/>

// Filter dropdowns
<select value={filters.roleType || ''} onChange={(e) => setFilters({ ...filters, roleType: e.target.value as AuditionRoleType, page: 0 })}>
  <option value="">All Role Types</option>
  <option value="LEAD">Lead</option>
  <option value="SUPPORTING">Supporting</option>
  <option value="BACKGROUND">Background</option>
  <option value="EXTRA">Extra</option>
</select>

<select value={filters.projectType || ''} onChange={(e) => setFilters({ ...filters, projectType: e.target.value as AuditionProjectType, page: 0 })}>
  <option value="">All Project Types</option>
  <option value="FEATURE_FILM">Feature Film</option>
  <option value="TV_SERIES">TV Series</option>
  <option value="COMMERCIAL">Commercial</option>
  {/* ... */}
</select>
```

#### Add Pagination
```tsx
const [auditions, setAuditions] = useState<Audition[]>([])
const [totalPages, setTotalPages] = useState(0)
const [totalElements, setTotalElements] = useState(0)

useEffect(() => {
  const fetchAuditions = async () => {
    try {
      setLoading(true)
      const response = await auditionService.getAllAuditions(filters)
      setAuditions(response.data)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      toast.error('Failed to load casting calls')
    } finally {
      setLoading(false)
    }
  }
  fetchAuditions()
}, [filters])

// Pagination controls
<div className="pagination">
  <button
    disabled={filters.page === 0}
    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
  >
    Previous
  </button>
  <span>Page {filters.page! + 1} of {totalPages}</span>
  <button
    disabled={filters.page! + 1 >= totalPages}
    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
  >
    Next
  </button>
</div>
```

#### Update Status Display
```tsx
// OLD
<span className={`status-${audition.status.toLowerCase()}`}>
  {audition.status}
</span>

// NEW - Handle uppercase
<span className={`status-${audition.status.toLowerCase()}`}>
  {audition.status.replace('_', ' ')}
</span>
```

#### Add Urgent/Featured Badges
```tsx
{audition.isUrgent && (
  <span className="badge-urgent">URGENT</span>
)}
{audition.isFeatured && (
  <span className="badge-featured">FEATURED</span>
)}
```

---

### 3. AuditionApplicationsPage.tsx

#### Add Application Filters
```tsx
const [filters, setFilters] = useState<ApplicationFilters>({
  status: undefined,
  isShortlisted: undefined,
  minRating: undefined,
  page: 0,
  size: 20
})

<select value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value as AuditionApplicationStatus, page: 0 })}>
  <option value="">All Statuses</option>
  <option value="APPLIED">Applied</option>
  <option value="UNDER_REVIEW">Under Review</option>
  <option value="SHORTLISTED">Shortlisted</option>
  <option value="CALLBACK_SCHEDULED">Callback Scheduled</option>
  <option value="CALLBACK_COMPLETED">Callback Completed</option>
  <option value="SELECTED">Selected</option>
  <option value="REJECTED">Rejected</option>
</select>

<label>
  <input
    type="checkbox"
    checked={filters.isShortlisted || false}
    onChange={(e) => setFilters({ ...filters, isShortlisted: e.target.checked || undefined, page: 0 })}
  />
  Shortlisted Only
</label>

<select value={filters.minRating || ''} onChange={(e) => setFilters({ ...filters, minRating: parseInt(e.target.value) || undefined, page: 0 })}>
  <option value="">All Ratings</option>
  <option value="5">5 Stars</option>
  <option value="4">4+ Stars</option>
  <option value="3">3+ Stars</option>
</select>
```

#### Add Rating Component
```tsx
const StarRating = ({ rating, onRate }: { rating?: number; onRate: (rating: number) => void }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className={star <= (rating || 0) ? 'star-filled' : 'star-empty'}
        >
          ★
        </button>
      ))}
    </div>
  )
}

// Usage
<StarRating
  rating={application.rating}
  onRate={(rating) => handleUpdateRating(application.id, rating)}
/>
```

#### Add Callback Scheduling
```tsx
const [showCallbackModal, setShowCallbackModal] = useState(false)
const [callbackData, setCallbackData] = useState({
  date: '',
  location: '',
  notes: ''
})

const handleScheduleCallback = async (applicationId: number) => {
  try {
    await auditionService.updateApplicationStatus(
      Number(auditionId),
      applicationId,
      'CALLBACK_SCHEDULED',
      {
        callbackDate: callbackData.date,
        callbackLocation: callbackData.location,
        callbackNotes: callbackData.notes
      }
    )
    toast.success('Callback scheduled successfully')
    setShowCallbackModal(false)
    fetchApplications()
  } catch (error) {
    toast.error('Failed to schedule callback')
  }
}

// Modal
{showCallbackModal && (
  <div className="modal">
    <h3>Schedule Callback</h3>
    <input
      type="datetime-local"
      value={callbackData.date}
      onChange={(e) => setCallbackData({ ...callbackData, date: e.target.value })}
      placeholder="Callback Date & Time"
    />
    <input
      value={callbackData.location}
      onChange={(e) => setCallbackData({ ...callbackData, location: e.target.value })}
      placeholder="Location"
    />
    <textarea
      value={callbackData.notes}
      onChange={(e) => setCallbackData({ ...callbackData, notes: e.target.value })}
      placeholder="Notes for artist"
    />
    <button onClick={() => handleScheduleCallback(selectedApplication)}>Schedule</button>
    <button onClick={() => setShowCallbackModal(false)}>Cancel</button>
  </div>
)}
```

#### Enhanced Bulk Actions
```tsx
const handleBulkAction = async (status: AuditionApplicationStatus) => {
  if (selectedApplications.length === 0) {
    toast.error('Please select at least one application')
    return
  }

  try {
    const result = await auditionService.bulkUpdateApplicationStatus(
      Number(auditionId),
      selectedApplications,
      status,
      status === 'REJECTED' ? { rejectionReason: 'Position filled' } : undefined
    )

    toast.success(`${result.successful} applications updated successfully`)

    if (result.failed > 0) {
      toast.warning(`${result.failed} failed: ${result.errorMessages.join(', ')}`)
    }

    setSelectedApplications([])
    fetchApplications()
  } catch (error) {
    toast.error('Failed to update applications')
  }
}

// Bulk action buttons
<button onClick={() => handleBulkAction('UNDER_REVIEW')}>
  Move to Review ({selectedApplications.length})
</button>
<button onClick={() => handleBulkAction('SHORTLISTED')}>
  Shortlist ({selectedApplications.length})
</button>
<button onClick={() => handleBulkAction('REJECTED')}>
  Reject ({selectedApplications.length})
</button>
```

#### Display Callback Info
```tsx
{application.status === 'CALLBACK_SCHEDULED' && application.callbackDate && (
  <div className="callback-info">
    <strong>Callback:</strong> {new Date(application.callbackDate).toLocaleString()}
    {application.callbackLocation && <span> at {application.callbackLocation}</span>}
    {application.callbackNotes && <p>{application.callbackNotes}</p>}
  </div>
)}
```

---

## Application Status Workflow

The backend enforces status transition rules:

```
APPLIED
  ↓ → UNDER_REVIEW
  ↓ → REJECTED
  ↓ → WITHDRAWN

UNDER_REVIEW
  ↓ → SHORTLISTED
  ↓ → REJECTED
  ↓ → WITHDRAWN

SHORTLISTED
  ↓ → CALLBACK_SCHEDULED
  ↓ → SELECTED
  ↓ → REJECTED
  ↓ → WITHDRAWN

CALLBACK_SCHEDULED
  ↓ → CALLBACK_COMPLETED
  ↓ → WITHDRAWN

CALLBACK_COMPLETED
  ↓ → SELECTED
  ↓ → REJECTED

SELECTED (Final)
REJECTED (Final)
WITHDRAWN (Final)
```

Invalid transitions will return an error from the backend.

---

## Field Migration Map

When updating existing components, use this mapping:

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `auditionMode` | `auditionFormat` | Enum values changed |
| `submissionDeadline` | `applicationDeadline` | Renamed |
| `budgetMin/budgetMax/currency` | `compensation` | Now free text |
| `languages[]` | `skillsRequired[]` | Different purpose |
| `category` | (removed) | No longer used |
| `experienceLevel` | `experienceRequired` | Changed to free text |
| `auditionTime` | `auditionDate` | Combined into single datetime |
| `status: 'Draft'` | `status: 'DRAFT'` | Uppercase |
| `status: 'Applied'` | `status: 'APPLIED'` | Uppercase |

---

## Testing Checklist

### Create Casting Call
- [ ] Fill all required fields
- [ ] Optional fields work correctly
- [ ] Validation errors display properly
- [ ] Save as draft (status: DRAFT)
- [ ] Publish immediately (status: OPEN)
- [ ] isUrgent and isFeatured flags save correctly

### List Casting Calls
- [ ] Displays all casting calls
- [ ] Search by title/description works
- [ ] Filter by status works
- [ ] Filter by role type works
- [ ] Filter by project type works
- [ ] Pagination works
- [ ] Urgent/Featured badges display
- [ ] Stats cards show correct numbers

### Manage Applications
- [ ] View all applications for a casting call
- [ ] Filter by status works
- [ ] Filter by shortlisted works
- [ ] Filter by rating works
- [ ] Update status (individual)
- [ ] Add rating
- [ ] Add notes
- [ ] Schedule callback with date/location/notes
- [ ] Bulk update with success/failure feedback
- [ ] Reject with feedback and reason
- [ ] Pagination works

### Status Transitions
- [ ] APPLIED → UNDER_REVIEW works
- [ ] UNDER_REVIEW → SHORTLISTED works
- [ ] SHORTLISTED → CALLBACK_SCHEDULED works
- [ ] CALLBACK_SCHEDULED → CALLBACK_COMPLETED works
- [ ] CALLBACK_COMPLETED → SELECTED works
- [ ] Any → REJECTED works
- [ ] Invalid transitions show error

---

## Next Steps

1. **Update CreateAuditionPage.tsx**
   - Replace form fields according to the new schema
   - Update validation logic
   - Test create and edit flows

2. **Update AuditionsListPage.tsx**
   - Add search bar
   - Add filter dropdowns
   - Implement pagination
   - Add urgent/featured badges
   - Update stats display

3. **Update AuditionApplicationsPage.tsx**
   - Add application filters
   - Implement rating system
   - Add callback scheduling
   - Enhance bulk actions with feedback
   - Update status workflow buttons

4. **Add CSS Styles**
   - Star rating component
   - Urgent/Featured badges
   - Callback info display
   - Pagination controls
   - Filter bar

5. **Testing**
   - Test with backend API
   - Verify all CRUD operations
   - Test status transitions
   - Test bulk operations
   - Test pagination and filtering

---

## API Base URL

Make sure your `apiClient.ts` points to the correct backend:

```typescript
const apiClient = axios.create({
  baseURL: 'http://api.icastar.com/api', // Update this to your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
})
```

---

## Questions?

Refer to the cURL commands document for detailed API examples and response formats.

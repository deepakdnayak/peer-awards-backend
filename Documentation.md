# Peer Awards Backend API Documentation

## Overview

This backend exposes REST APIs for a peer awards system. It supports:
- OTP-based authentication
- Student and admin user management
- Title creation and voting
- Nomination creation and administration
- Final nomination generation, voting, results, and admin stats

All application routes are mounted under `/api`.

Base route prefixes:
- `/api/auth`
- `/api/user`
- `/api/titles`
- `/api/nominations`
- `/api/final`

---

## Authentication

### Common requirement

Protected endpoints require an `Authorization` header with a JWT:

```
Authorization: Bearer <token>
```

Users authenticated via OTP receive this token from `/api/auth/verify-otp`.

### Endpoints

#### `POST /api/auth/send-otp`

Description: Send a one-time OTP to a registered user's email based on their USN.

Request body:
```json
{
  "usn": "12345678"
}
```

Response:
```json
{
  "message": "OTP sent",
  "email": "user@***"
}
```

Errors:
- `400` if user is not found.

#### `POST /api/auth/verify-otp`

Description: Verify the OTP and return a JWT.

Request body:
```json
{
  "usn": "12345678",
  "otp": "123456"
}
```

Response:
```json
{
  "token": "<jwt token>"
}
```

Errors:
- `400` if the OTP is invalid or expired.

#### `GET /api/auth/me`

Description: Get the authenticated user's profile.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "_id": "...",
  "name": "Student Name",
  "usn": "12345678",
  "email": "user@example.com",
  "role": "student"
}
```

Errors:
- `401` if the JWT is missing or invalid.

---

## User Management

### `POST /api/user/upload-users`

Description: Upload users from a CSV file. Admin-only.

Protection:
- `authMiddleware`
- `adminMiddleware`

Request:
- Content type: `multipart/form-data`
- Field name: `file`
- File should be a CSV with columns: `name`, `usn`, `email`

Response:
```json
{
  "added": 10,
  "skipped": 2
}
```

Errors:
- `400` if the file is missing.
- `500` if upload processing fails.

### `GET /api/user/all`

Description: List all student users.

Response:
```json
[
  {
    "_id": "...",
    "name": "Student Name",
    "usn": "12345678",
    "email": "user@example.com",
    "role": "student"
  }
]
```

---

## Title Management

### `POST /api/titles/`

Description: Create a new title nomination. Requires authentication.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "titleName": "Best Team Player",
  "description": "Award for the most collaborative team member"
}
```

Response:
- Returns created title document.

Notes:
- Title names are normalized for uniqueness.
- Duplicate title names are rejected.

### `GET /api/titles/`

Description: Retrieve approved and active titles.

Response:
- Array of titles with fields such as `titleName`, `description`, `status`, `upvotesCount`, `downvotesCount`, `isActive`.

### `POST /api/titles/vote`

Description: Vote on a title as authenticated user.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "titleId": "<titleId>",
  "voteType": "upvote"
}
```

Allowed `voteType` values:
- `upvote`
- `downvote`

Response:
```json
{
  "message": "Vote added"
}
```

or

```json
{
  "message": "Vote updated"
}
```

### Admin Title Endpoints

#### `GET /api/titles/admin/all`

Description: Get every title record, including pending and inactive titles.

Protection:
- `authMiddleware`
- `adminMiddleware`

#### `PUT /api/titles/admin/:id`

Description: Update an existing title. Admin-only.

Protection:
- `authMiddleware`
- `adminMiddleware`

Request body may include:
- `titleName`
- `description`
- `status`
- other title fields

Response:
- Returns the updated title.

#### `DELETE /api/titles/admin/:id`

Description: Soft-delete a title by setting `isActive` to `false`.

Protection:
- `authMiddleware`
- `adminMiddleware`

#### `PATCH /api/titles/admin/approve/:id`

Description: Approve a pending title.

Protection:
- `authMiddleware`
- `adminMiddleware`

Response:
- Returns the approved title document.

---

## Nomination Management

### `POST /api/nominations/`

Description: Create a nomination for a specific title. Auth required.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "titleId": "<titleId>",
  "nomineeId": "<userId>"
}
```

Response:
- Returns the created nomination.

Notes:
- Only approved, active titles may be nominated.
- Each user may nominate only once per title.

### `PUT /api/nominations/`

Description: Update an existing nomination.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "titleId": "<titleId>",
  "nomineeId": "<newNomineeId>"
}
```

Response:
- Returns the updated nomination.

### `GET /api/nominations/me`

Description: Get nominations submitted by the authenticated user.

Headers:
- `Authorization: Bearer <token>`

Response:
- Returns nomination objects populated with nominee and title details.

### `GET /api/nominations/admin/top`

Description: Admin-only endpoint returning top nominees per title.

Protection:
- `authMiddleware`
- `adminMiddleware`

Response:
- Aggregated top nominee counts grouped by title.

---

## Final Voting and Results

### `POST /api/final/admin/finalize`

Description: Generate final nominee pools from nomination counts. Admin-only.

Protection:
- `authMiddleware`
- `adminMiddleware`

Response:
- Returns created `FinalNominee` records.

### `GET /api/final/admin/stats`

Description: Admin-only voter and results statistics.

Protection:
- `authMiddleware`
- `adminMiddleware`

Response:
```json
{
  "totalVoters": 123,
  "stats": [ ... ]
}
```

### `POST /api/final/vote`

Description: Submit voting for final nominees. Auth required.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "votes": [
    { "titleId": "<titleId>", "nomineeId": "<userId>" },
    { "titleId": "<titleId2>", "nomineeId": "<userId2>" }
  ]
}
```

Response:
```json
{
  "message": "Vote submitted successfully"
}
```

Notes:
- Voting is allowed only while `SystemConfig.isVotingOpen` is `true`.
- Each user may submit votes only once.

### `GET /api/final/nominees`

Description: Fetch finalized nominees for final voting.

Response:
- Returns titles with their final nominee lists.

Errors:
- `400` if nominees have not been finalized yet.

### `GET /api/final/results`

Description: Fetch final winners after voting is closed.

Response:
- Returns result entries with title, winner information, and vote count.

Errors:
- `400` if results are requested while voting is still open.

### `POST /api/final/admin/freeze-voting`

Description: Close voting and calculate final winners. Admin-only.

Protection:
- `authMiddleware`
- `adminMiddleware`

Response:
- Returns saved result records.

Notes:
- Updates `SystemConfig` to close voting and move the app to results phase.

---

## Models Summary

### User
- `name`
- `usn`
- `email`
- `role` (`student` or `admin`)

### Title
- `titleName`
- `description`
- `status` (`pending`, `approved`, `rejected`)
- `upvotesCount`
- `downvotesCount`
- `isActive`
- `createdBy`
- `approvedBy`
- `approvedAt`

### Nomination
- `titleId`
- `nominatedBy`
- `nomineeId`

### FinalNominee
- `titleId`
- `nominees` (top nominees array)
- `generatedAt`

### Vote
- `userId`
- `titleId`
- `nomineeId`

### Result
- `titleId`
- `winnerId`
- `voteCount`

### SystemConfig
- `currentPhase`
- `isVotingOpen`

---

## Authentication and Authorization

- `authMiddleware` protects endpoints by verifying the JWT in `Authorization`.
- `adminMiddleware` requires `user.role === "admin"`.
- Admin-only endpoints are used for CSV upload, title administration, nominee finalization, voting freeze, and administrative stats.

---

## Notes

- `/api/user/all` returns only student users.
- Title creation and nomination flows require the underlying title to be approved and active.
- Final voting requires the system config to have voting open.
- CSV user import expects a `file` field in `multipart/form-data`.

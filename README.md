# 🏆 CSD Peer Awards 2026 — Backend

> A production-grade peer voting and awards system built for the Computer Science & Design department's farewell batch of 2026. This backend powers a three-phase class awards platform — from title crowdsourcing to final winner announcement — for approximately 62 students.

---

## 📌 Table of Contents

- [Overview](#overview)
- [User Roles](#user-roles)
- [System Phases](#system-phases)
- [Tech Stack](#tech-stack)
- [Tools & Platforms](#tools--platforms)
- [Project Structure](#project-structure)
- [Database Collections](#database-collections)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

**CSD Peer Awards 2026** is a full-stack web application designed to let a graduating engineering class crowdsource award titles, nominate classmates, and vote for winners — all in a controlled, authenticated environment. The backend is built with **Node.js**, **Express.js**, and **TypeScript**, connected to a **MongoDB Atlas** cloud database.

The system is designed for exactly **~62 users** and is not intended for public access. All users are pre-seeded by the admin via a CSV upload — no public registration is permitted.

---

## 👥 User Roles

The system has two distinct user types:

### 🎓 Student
- Authenticated via USN + OTP (sent to official college email)
- Can suggest award titles
- Can upvote or downvote suggested titles (once per title)
- Can nominate one classmate per title (including self-nomination)
- Can update their nomination for a title
- Can vote for one finalist per title during final voting

### 🛡️ Admin (You)
- Full control over the system
- Seeds users via CSV upload
- Approves or rejects suggested titles
- Creates, edits, and soft-deletes titles manually
- Views all nominations and top nominees per title
- Freezes/finalises nominees before final voting begins
- Manages system phase (controls which phase is active)
- Has access to a dedicated admin dashboard API

---

## 🔄 System Phases

The application operates in **three sequential phases**, controlled by the admin via the `system_config` collection:

### Phase 1 — Title Creation 🏷️
> Students suggest award categories. Other students upvote or downvote submissions. The admin reviews and approves titles before they go live.

- Students submit title suggestions (e.g., *"Funniest Person"*, *"Silent Killer"*, *"Most Likely to be CEO"*)
- Duplicate titles (case-insensitive) are rejected at the API level
- Titles remain in `pending` status until admin approves them
- Only `approved` + `isActive: true` titles appear on the public listing
- Admin can reject, update, or soft-delete any title at any time

### Phase 2 — Nominations 🗳️
> Students nominate one classmate per approved title. The system aggregates nominations and the admin can view the top 6 nominees per title.

- One nomination per user per title (enforced by unique DB index)
- Self-nomination is allowed
- Users can update their nominee for a title at any time during this phase
- Admin can view a fully populated leaderboard of top 6 nominees per title
- Admin finalises nominees to lock the phase and prepare for final voting

### Phase 3 — Final Voting 🏅
> Students vote for one finalist per title. After the deadline, the admin reveals results.

- Only the top 6 shortlisted nominees per title are eligible
- One vote per user per title (enforced by unique DB index)
- Votes are locked after submission (no editing)
- After voting closes, the admin triggers result announcement

### Phase 4 — Results Announcement 🎉
> Winners are publicly displayed with vote counts and rankings.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| OTP Delivery | Nodemailer + Gmail SMTP |
| File Uploads | Multer |
| CSV Parsing | csv-parser |

---

## 🧰 Tools & Platforms

| Tool | Purpose |
|---|---|
| **Visual Studio Code** | Primary code editor |
| **Postman** | API testing and documentation |
| **MongoDB Atlas** | Cloud-hosted database |
| **Git** | Version control |
| **GitHub** | Remote repository and code storage |
| **Railway / Render** | Backend hosting (free tier) |
| **Vercel** | Frontend hosting (Next.js) |

---

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │   └── db.ts                    # MongoDB connection setup
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts   # OTP send/verify, get current user
│   │   │   ├── auth.service.ts      # Core auth logic
│   │   │   └── auth.routes.ts       # Auth route definitions
│   │   │
│   │   ├── final/
│   │   │   ├── finalNominee.model.ts # Final Nominee schema
│   │   │   ├── result.model.ts       # Final Result schema
│   │   │   ├── vote.model.ts         # Vote schema
│   │   │   ├── final.service.ts      # Final Service logic
│   │   │   ├── final.controller.ts   # Final Route handler
│   │   │   └── final.routes.ts       # Final routes
│   │   ├── user/
│   │   │   ├── user.model.ts        # Mongoose user schema
│   │   │   ├── user.service.ts      # CSV processing logic
│   │   │   ├── user.controller.ts   # CSV upload handler
│   │   │   └── user.routes.ts       # Admin user routes
│   │   │
│   │   ├── title/
│   │   │   ├── title.model.ts       # Title schema
│   │   │   ├── titleVote.model.ts   # Upvote/downvote schema
│   │   │   ├── title.service.ts     # Title business logic
│   │   │   ├── title.controller.ts  # Title request handlers
│   │   │   └── title.routes.ts      # Title routes (student + admin)
│   │   │
│   │   └── nomination/
│   │       ├── nomination.model.ts  # Nomination schema
│   │       ├── nomination.service.ts# Nomination logic + aggregation
│   │       ├── nomination.controller.ts
│   │       └── nomination.routes.ts
│   │
│   ├── models/
│   │   └── otp.model.ts             # OTP session schema
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts        # JWT verification
│   │   └── admin.middleware.ts       # Role-based access guard
│   │
│   ├── utils/
│   │   ├── otp.ts                   # OTP generator (6-digit)
│   │   └── mailer.ts                # Nodemailer + Gmail SMTP
│   │
│   ├── app.ts                        # Express app + route mounting
│   └── server.ts                     # Entry point, DB connect, listen
│
├── uploads/                          # Temporary CSV storage (multer)
├── .env                              # Environment variables (not committed)
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `users` | All students and admin (pre-seeded) |
| `otps` | Temporary OTP sessions with expiry |
| `titles` | Award category suggestions |
| `titlevotes` | Upvote / downvote records per title |
| `nominations` | Nomination records (1 per user per title) |
| `finalvotes` | Final voting records (Phase 3) |
| `system_config` | Current phase and global app settings |

---

## 🔐 Authentication Flow

This system uses **OTP-based authentication** — no passwords, no registration.

```
Step 1: Student enters their University Seat Number (USN)
         ↓
Step 2: Backend finds the user in the pre-seeded database
         ↓
Step 3: A 6-digit OTP is generated and emailed to their official college email
         ↓ (Email is partially masked in the response, e.g. "deepa***@college.edu")
Step 4: Student enters the OTP
         ↓
Step 5: Backend validates OTP (5-minute expiry window)
         ↓
Step 6: JWT token issued → used for all subsequent authenticated requests
```

> **Why this approach?** It prevents impersonation (no one can guess another's OTP), eliminates password management, and leverages the college's official email infrastructure for identity verification.

---

## 📡 API Endpoints

Few endpoints prefixed with `/api`.

---

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/send-otp` | ❌ Public | Enter USN → receive OTP on official email |
| `POST` | `/auth/verify-otp` | ❌ Public | Submit OTP → receive JWT token |
| `GET` | `/auth/me` | ✅ Student | Get current logged-in user details |

**Example — Send OTP:**
```json
POST /api/auth/send-otp
{
  "usn": "4XX21CS001"
}
```

**Example — Verify OTP:**
```json
POST /api/auth/verify-otp
{
  "usn": "4XX21CS001",
  "otp": "482910"
}
```

---

### 👤 Users (Admin) — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/upload-users` | ✅ Admin | Upload CSV to seed or add new students |

**CSV Format:**
```csv
name,usn,email
Deepak Nayak,4XX21CS001,deepak@college.edu
Karthik Rao,4XX21CS002,karthik@college.edu
Ananya Shetty,4XX21CS003,ananya@college.edu
```

> Re-uploading a CSV will **only add new users**. Existing users (matched by USN) are skipped. No data is lost. Permanent deletion is a separate admin action.

---

### 🏷️ Titles — `/api/titles`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/titles` | ✅ Student | Suggest a new award title |
| `GET` | `/titles` | ❌ Public | Get all approved + active titles |
| `POST` | `/titles/vote` | ✅ Student | Upvote or downvote a title |
| `GET` | `/titles/admin/all` | ✅ Admin | Get all titles (pending, approved, rejected) |
| `PATCH` | `/titles/admin/approve/:id` | ✅ Admin | Approve a pending title |
| `PUT` | `/titles/admin/:id` | ✅ Admin | Update title name or description |
| `DELETE` | `/titles/admin/:id` | ✅ Admin | Soft-delete a title (sets `isActive: false`) |

**Example — Create Title:**
```json
POST /api/titles
Authorization: Bearer <token>
{
  "titleName": "Funniest Person",
  "description": "The one who keeps the whole class laughing"
}
```

**Example — Vote:**
```json
POST /api/titles/vote
Authorization: Bearer <token>
{
  "titleId": "665f3abc...",
  "voteType": "upvote"
}
```

> Duplicate title names are rejected (case-insensitive, whitespace-trimmed). Users can change their vote type (upvote ↔ downvote) but cannot vote twice.

---

### 🗳️ Nominations — `/api/nominations`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/nominations` | ✅ Student | Nominate a classmate for an approved title |
| `PUT` | `/nominations` | ✅ Student | Update your existing nomination for a title |
| `GET` | `/nominations/me` | ✅ Student | View all your nominations (populated) |
| `GET` | `/nominations/admin/top` | ✅ Admin | View top 6 nominees per title (populated) |

**Example — Nominate:**
```json
POST /api/nominations
Authorization: Bearer <token>
{
  "titleId": "665f3abc...",
  "nomineeId": "665f1xyz..."
}
```

**Example — Admin Top Nominees Response:**
```json
[
  {
    "titleId": "665f3abc...",
    "title": { "titleName": "Funniest Person" },
    "topNominees": [
      { "count": 18, "user": { "name": "Deepak Nayak", "usn": "4XX21CS001" } },
      { "count": 15, "user": { "name": "Karthik Rao", "usn": "4XX21CS002" } }
    ]
  }
]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- A MongoDB Atlas cluster
- A Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/csd-peer-awards-2026-backend.git
cd csd-peer-awards-2026-backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Fill in values (see Environment Variables section)

# Start development server
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/csd-awards
JWT_SECRET=your_super_secret_key_here
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 📜 Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

---

## 📬 Testing with Postman

1. Import all endpoints into a Postman Collection
2. Set a collection variable: `BASE_URL = http://localhost:5000`
3. After login, set: `TOKEN = <jwt from verify-otp response>`
4. Use `Authorization: Bearer {{TOKEN}}` header on protected routes

> Recommended test order: Upload CSV → Send OTP → Verify OTP → Create Title → Admin Approve → Vote → Nominate → Admin view Top Nominees

---

## 🔒 Security Notes

- OTPs expire after **5 minutes**
- JWTs expire after **1 day**
- All admin routes are protected by both `authMiddleware` and `adminMiddleware`
- Duplicate votes and nominations are prevented at both application and database index level
- Titles are soft-deleted (not permanently removed) to preserve audit integrity

---

## 🗂️ Version Control

- **Git** is used for local version control
- **GitHub** is used as the remote repository
- Recommended branch strategy: `main` (production) + `dev` (active development)

```bash
git add .
git commit -m "feat: add nomination phase APIs"
git push origin dev
```

---

## 👨‍💻 Author

Built with ❤️ for the CSD Batch of 2026 Farewell  
Department of Computer Science & Design  

---

*This project is private and intended for internal use by ~62 registered users only.*
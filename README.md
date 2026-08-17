# BotBlogs 📝 — Modern Full-Stack Blogging & Media Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Express-4.19-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.11-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Firebase Auth](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase)](https://firebase.google.com/)

A modern, Reddit & Instagram-inspired blogging and media platform featuring **zero-lag optimistic UI updates**, **in-memory caching**, **multi-stage Docker containerization**, and **multi-layered cyber-security defenses**.

---

## 🏗️ Architecture Overview

```
BotBlogs/
├── .github/workflows/ci.yml   # Automated GitHub Actions CI workflow
├── docker-compose.yml         # Production multi-container orchestration
├── package.json               # Monorepo runner & Docker scripts
│
├── backend/                   # Hardened Express.js REST API (Port 5000)
│   ├── Dockerfile             # Multi-stage production container build
│   ├── prisma/                # PostgreSQL schema & migrations
│   ├── src/
│   │   ├── controllers/       # Post, user, vote, bookmark, category, upload handlers
│   │   ├── middleware/        # Firebase Auth verification, OWASP sanitizer, CSRF guard
│   │   ├── routes/            # Express API routing
│   │   ├── utils/             # Prisma client, NodeCache & Cloudinary uploader
│   │   └── server.js          # Express app, Helmet, compression, rate-limits, /health
│   ├── .env.example           # Backend environment template
│   └── package.json
│
└── frontend/                  # Next.js 14 App Router Client (Port 3000)
    ├── Dockerfile             # Multi-stage standalone container build
    ├── next.config.js         # Security headers, standalone output, sharp image optimization
    ├── src/
    │   ├── app/               # Pages, error boundaries, sitemap.xml, robots.txt
    │   ├── components/        # AppShell, PostComposer, Card, Navbar, etc.
    │   ├── context/           # Firebase Auth & Theme context
    │   ├── providers/         # Global provider wrappers
    │   └── utils/             # Firebase SDK client & authenticated fetch utilities
    ├── .env.example           # Frontend environment template
    └── package.json
```

---

## 🌟 Key Platform Features

### ⚡ 1. High Performance & 0ms Optimistic UI
- **Server In-Memory Caching (`appCache`)**: High-performance Node-Cache integration delivering sub-10ms response times for feeds, categories, and user profiles with automatic invalidation on mutations (create, edit, vote, delete).
- **0ms Optimistic UI**: Upvoting, downvoting, bookmarking, and following/unfollowing update state immediately with tactile spring animations without waiting for network round-trips.
- **Ultra-Fast Debounced Search**: Live creator search with 80ms debounce for instant search dropdown suggestions.

### 👥 2. View-Only Other Profiles & Creator Profiles
- **View-Only Security**: Viewing another user's profile displays their public articles, bio, join date, and followers in read-only mode, keeping sensitive controls (edit bio, avatar upload, private bookmarks) restricted to the owner.
- **Dynamic Follow / Unfollow**: Interactive hover feedback with live follower counter sync.
- **Universal Creator Linking**: Commenters, card authors, and search results link seamlessly to user profiles.

### 🎨 3. Responsive App Shell & Modern Aesthetics
- **Desktop Sidebar Navigation (>= 1024px)**: Fixed left navigation sidebar with notification badges and theme switcher.
- **Mobile Bottom Bar (< 1024px)**: Responsive bottom navigation bar tailored for smartphone viewports.
- **Right Sidebar Utilities**: Trending hashtags and Suggested Accounts with 1-click profile preview.
- **Eye-Friendly Dark & Light Modes**: Glare-free light theme with zero-flash SSR protection.

### 🛡️ 4. Enterprise Cyber Security
- **OWASP Top 10 Sanitization**: Input sanitizer stripping XSS vectors, prototype pollution, and null-byte injections.
- **Anti-CSRF Origin Guard**: Rejects malicious cross-origin mutation requests.
- **Strict Rate Limiting**: Distributed IP rate limiters on API and media upload endpoints.
- **Helmet HTTP Headers**: HSTS (1-year preload), NoSniff, Frameguard, and custom Permissions Policy.
- **Deep `/health` Endpoint**: Live database latency check for Kubernetes, AWS ALB, Render, and Railway probes.

---

## 🚀 Quick Start (Docker Compose)

Spin up PostgreSQL, the Backend API, and the Next.js Frontend together in production mode:

```bash
# 1. Clone repository
git clone https://github.com/raghulv2006/CodeAlpha_BlogApp.git
cd BotBlogs

# 2. Configure environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Build and launch all services in detached mode
npm run docker:up

# 4. View live logs
npm run docker:logs
```

Services will be available at:
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

To stop services:
```bash
npm run docker:down
```

---

## 🛠️ Local Development Setup

### 1. Backend Setup

```bash
cd backend
npm install

# Setup your local PostgreSQL DATABASE_URL in backend/.env
npx prisma db push
npx prisma generate

npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Set your NEXT_PUBLIC_API_URL and Firebase keys in frontend/.env
npm run dev
# Running on http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"
CLIENT_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
```

---

## 📜 Monorepo Scripts

| Command | Action |
|---|---|
| `npm run dev:backend` | Starts Express API server with Nodemon on port 5000 |
| `npm run dev:frontend` | Starts Next.js dev server on port 3000 |
| `npm run build` | Builds Prisma client and Next.js production standalone bundle |
| `npm run docker:build` | Builds production Docker images for Backend and Frontend |
| `npm run docker:up` | Starts Postgres, Backend, and Frontend containers |
| `npm run docker:down` | Gracefully stops all containers |
| `npm run docker:logs` | Streams live logs from all containers |

---

## 🔌 API Reference Summary

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Deep health check with PostgreSQL connectivity & latency |
| `GET` | `/api/categories` | No | List all active categories/communities |
| `POST` | `/api/categories` | Yes | Create a new community |
| `GET` | `/api/tags/trending` | No | List trending hashtags |
| `GET` | `/api/posts` | No | Paginated posts (`?page=1&cat=coding&tag=nextjs&sort=hot`) |
| `GET` | `/api/posts/:slug` | No | Fetch post details & increment view count |
| `POST` | `/api/posts` | Yes | Publish a new post |
| `PUT` | `/api/posts/:slug` | Yes | Edit an existing post (Author only) |
| `DELETE` | `/api/posts/:slug` | Yes | Delete a post (Author only) |
| `POST` | `/api/posts/:slug/vote` | Yes | Cast or toggle upvote/downvote (+1 / -1 / 0) |
| `POST` | `/api/posts/:slug/bookmark` | Yes | Toggle post bookmark |
| `GET` | `/api/comments` | No | Fetch comments for a post (`?postSlug=:slug`) |
| `POST` | `/api/comments` | Yes | Post a comment & notify post author |
| `GET` | `/api/notifications` | Yes | Fetch user notifications & unread count |
| `POST` | `/api/notifications/read` | Yes | Mark notifications as read |
| `GET` | `/api/users/profile` | No | Fetch user profile and stats by email or ID |
| `PUT` | `/api/users/profile` | Yes | Update user display name, bio, or avatar |
| `POST` | `/api/users/follow` | Yes | Follow or unfollow a user by email or ID |
| `GET` | `/api/users/search` | No | Search creators with debounced autocomplete |
| `GET` | `/api/users/suggested` | No | List suggested creators to follow |
| `POST` | `/api/upload` | Yes | Upload image/video to Cloudinary |

---

## 📄 License
This project is open-source under the MIT License.

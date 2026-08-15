# BotBlogs 📝 (Decoupled Architecture)

A full-stack, Reddit/Instagram-inspired dark-themed blogging and media platform split into two dedicated services: a **Next.js 14 App Router Frontend** and an **Express.js + Prisma PostgreSQL Backend** with **Firebase Authentication**.

---

## 🏗️ Architecture Overview

```
BotBlogs/
├── backend/                  # Express.js REST API Server (Port 5000)
│   ├── prisma/               # PostgreSQL Database Schema & Migration files
│   ├── src/
│   │   ├── controllers/      # Handlers for posts, categories, tags, comments, votes, users, upload
│   │   ├── routes/           # Express router endpoints (/api/posts, /api/categories, /api/tags, etc.)
│   │   └── utils/            # Prisma Client & Cloudinary SDK
│   ├── .env.example          # Environment variables for Backend
│   └── package.json
│
├── frontend/                 # Next.js 14 App Router Client (Port 3000)
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── app/              # App Router pages (Home, Blog, Post Details, Edit, Profile, Login, Write)
│   │   ├── components/       # Dark-themed UI components (PostComposer, Card, CardList, Featured, etc.)
│   │   ├── context/          # Firebase Auth & Theme context
│   │   └── providers/        # Auth & Theme wrappers
│   ├── .env.example          # Environment variables for Frontend
│   └── package.json
│
└── package.json              # Root directory runner scripts
```

---

## 🌟 Key Features

- 📸 **Instagram-Style Media-First Composer**: Drag-and-drop file dropzone with live upload progress percentage bar, inline media card preview, removable media, caption textarea, hashtag chip management, and inline community creation.
- 🎨 **Reddit-Style Dark UI & Upvoting**: `#0b0b0b` sleek dark theme with real PostgreSQL-backed upvoting/downvoting.
- 🏷️ **Dynamic Communities & Hashtags**: User-created categories/communities and searchable hashtag filtering (`#tag`).
- ⚡ **Performance Optimized**: Initial data pre-fetching server-side via Next.js RSC `fetch` combined with client-side SWR caching (zero waterfall).
- ☁️ **Cloudinary Media Uploads**: Stream image and video uploads directly to Cloudinary storage.
- 🐘 **PostgreSQL & Prisma ORM**: Relational schema containing `User`, `Post`, `Category`, `Tag`, `Vote`, `Comment`, `Follow`, `Account`, and `Session`.
- 🔐 **Firebase Authentication**: User authentication via Firebase Auth with `useSession()` compatibility wrapper.
- ✏️ **Post Creation & Editing**: Create new posts or edit existing posts through `/write` and `/posts/[slug]/edit`.

---

## 🚀 Getting Started

### 1. Backend Setup (Express + PostgreSQL + Cloudinary)

Navigate to the `backend/` folder:

```bash
cd backend
npm install
```

Create a `backend/.env` file based on `backend/.env.example`:

```env
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/botblogs?schema=public"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

Sync PostgreSQL database schema with Prisma:

```bash
npx prisma db push
npx prisma generate
```

Start the backend API server:

```bash
npm run dev
# Running on http://localhost:5000
```

---

### 2. Frontend Setup (Next.js 14 App Router + Firebase)

Open a new terminal window and navigate to the `frontend/` folder:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file based on `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"

NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
```

Start the Next.js development server:

```bash
npm run dev
# Running on http://localhost:3000
```

---

## 🔌 API Routes Summary (`backend/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Fetch all communities/categories |
| `POST` | `/api/categories` | Create a new community/category |
| `GET` | `/api/tags` | Fetch popular tags |
| `GET` | `/api/posts?page=1&cat=coding&tag=nextjs&sort=hot` | Fetch paginated posts with category/tag filters and sorting |
| `GET` | `/api/posts/:slug` | Fetch post details & increment view count |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/:slug` | Update an existing post |
| `POST` | `/api/posts/:slug/vote` | Upvote, downvote, or remove vote on a post |
| `GET` | `/api/comments?postSlug=:slug` | Fetch comments for a post |
| `POST` | `/api/comments` | Post a comment on an article |
| `GET` | `/api/users/profile` | Fetch user profile and stats |
| `PUT` | `/api/users/profile` | Update display name, bio, or image |
| `POST` | `/api/users/follow` | Toggle follow/unfollow user |
| `POST` | `/api/users/dismiss-welcome` | Mark welcome hero banner as seen for user |
| `POST` | `/api/upload` | Upload image or video file to Cloudinary |

---

## 📜 Available Scripts

From the root project directory:

- `npm run dev:backend`: Starts the backend API server on port 5000.
- `npm run dev:frontend`: Starts the Next.js client on port 3000.
- `npm run build:frontend`: Builds the Next.js frontend for production.


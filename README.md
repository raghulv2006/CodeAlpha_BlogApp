# BotBlogs 📝 (Decoupled Architecture)

A full-stack, Reddit-inspired dark-themed blogging platform split into two dedicated services: a **Next.js 13 Frontend** and an **Express.js + Prisma PostgreSQL Backend**.

---

## 🏗️ Architecture Overview

```
BotBlogs/
├── backend/                  # Express.js REST API Server (Port 5000)
│   ├── prisma/               # PostgreSQL Database Schema & Migration files
│   ├── src/
│   │   ├── controllers/      # Handlers for posts, categories, comments, Cloudinary upload
│   │   ├── routes/           # Express router endpoints (/api/posts, /api/upload, etc.)
│   │   └── utils/            # Prisma Client & Cloudinary SDK
│   ├── .env.example          # Environment variables for Backend
│   └── package.json
│
├── frontend/                 # Next.js 13 App Router Client (Port 3000)
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── app/              # App Router pages (Home, Blog, Post Details, Login, Write)
│   │   ├── components/       # Reddit dark-themed UI components
│   │   ├── context/          # Dark theme context
│   │   └── providers/        # Auth & Theme wrappers
│   ├── .env.example          # Environment variables for Frontend
│   └── package.json
│
└── package.json              # Root directory runner scripts
```

---

## 🌟 Features

- 🎨 **Reddit-Inspired Dark Theme**: `#0b0b0b` black background with `#22c55e` vibrant green accents.
- ⚡ **Decoupled API Server**: Express.js REST API server handling all database queries and media streaming.
- ☁️ **Cloudinary Media Uploads**: Instant image and video uploads directly stream to Cloudinary storage.
- 🐘 **PostgreSQL & Prisma ORM**: Relational database models for Users, Accounts, Sessions, Posts, Categories, and Comments.
- ✨ **Framer Motion Micro-Animations**: Smooth card hover elevation, upvote arrows, sticky collapsible sidebar, and route transitions.
- 🔐 **NextAuth.js OAuth**: Google and GitHub login integration.

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

### 2. Frontend Setup (Next.js 13 App Router)

Open a new terminal window and navigate to the `frontend/` folder:

```bash
cd frontend
npm install
```

Create a `frontend/.env.local` file based on `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

GOOGLE_ID="your_google_client_id"
GOOGLE_SECRET="your_google_client_secret"

GITHUB_ID="your_github_client_id"
GITHUB_SECRET="your_github_client_secret"
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
| `GET` | `/api/categories` | Fetch all blog categories |
| `GET` | `/api/posts?page=1&cat=coding` | Fetch paginated posts with optional category filter |
| `GET` | `/api/posts/:slug` | Fetch post details & increment view count |
| `POST` | `/api/posts` | Create a new blog post |
| `GET` | `/api/comments?postSlug=:slug` | Fetch comments for a post |
| `POST` | `/api/comments` | Post a comment on an article |
| `POST` | `/api/upload` | Upload image or video file to Cloudinary |

---

## 📜 Available Scripts

From the root project directory:

- `npm run dev:backend`: Starts the backend API server on port 5000.
- `npm run dev:frontend`: Starts the Next.js client on port 3000.
- `npm run build:frontend`: Builds the Next.js frontend for production.

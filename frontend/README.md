# 🚀 BotBlogs — Frontend Documentation

Welcome to the frontend codebase documentation for **BotBlogs**, a modern, full-stack, Instagram/Reddit-inspired blogging and media platform built with **Next.js 14 (App Router)**, **React 18**, **Framer Motion**, **SWR**, **Firebase Authentication**, and **Vanilla CSS Modules**.

---

## 📁 Directory Structure

```
frontend/
├── public/                     # Static media assets, icons, and branding
├── src/
│   ├── app/                    # Next.js 14 App Router Pages & Layouts
│   │   ├── about/              # About us, directory links & platform sitemap
│   │   ├── blog/               # Category & tag filtered feed page
│   │   ├── login/              # Firebase Google login page
│   │   ├── notifications/      # Live user alerts & notification feed
│   │   ├── posts/[slug]/       # Single post detail view page
│   │   ├── posts/[slug]/edit/  # Author-protected edit post page
│   │   ├── profile/            # View-only & owner profile pages with follow toggle
│   │   ├── write/              # Multi-step media-first post composer
│   │   ├── error.jsx           # Graceful error boundary UI
│   │   ├── not-found.jsx       # Custom 404 page
│   │   ├── globals.css         # Global design system & theme variables
│   │   ├── homepage.module.css # Styles for landing page
│   │   ├── layout.js           # Root layout wrapping AppShell & Providers
│   │   ├── page.jsx            # Home page (Main Feed with Server Prefetching)
│   │   ├── robots.js           # Search engine robots configuration
│   │   └── sitemap.js          # Dynamic XML sitemap generator
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── animation/          # PageTransition animation wrapper
│   │   ├── appShell/           # Responsive Desktop & Mobile AppShell with Sidebars
│   │   ├── authLinks/          # Auth status links & mobile drawer
│   │   ├── bookmarkArticleButton/ # 1-click bookmarking button
│   │   ├── card/               # Post card with 0ms optimistic voting & bookmarking
│   │   ├── cardList/           # Infinite scroll feed container with SWR caching
│   │   ├── categoryList/       # Horizontal community category filter bar
│   │   ├── comments/           # Interactive post comments with author links
│   │   ├── deleteArticleButton/# Author-only delete post confirmation modal
│   │   ├── editArticleButton/  # Author-only conditional post edit button
│   │   ├── featured/           # Dismissible welcome hero banner
│   │   ├── keyboardShortcuts/  # Global keyboard shortcut handler & help modal
│   │   ├── menuPosts/          # Dynamic trending posts widget
│   │   ├── navbar/             # Top sticky navbar with debounced search
│   │   ├── postComposer/       # Multi-step rich media post creator
│   │   ├── singlePostMedia/    # 4:3 ratio media container
│   │   ├── skeleton/           # Shimmer loading skeleton cards
│   │   └── themeToggle/        # Dark / Light theme toggle switch
│   │
│   ├── context/                # React Context State Management
│   │   ├── AuthContext.jsx     # Firebase Auth Context shim
│   │   └── ThemeContext.jsx    # Light/Dark Theme Context with eye-flash protection
│   ├── providers/              # Higher-Order Provider Wrappers
│   │   ├── AuthProvider.jsx    # Auth Provider wrapper
│   │   └── ThemeProvider.jsx   # Theme Provider wrapper (SSR flash guard)
│   └── utils/                  # Helper Utilities
│       ├── api.js              # Authenticated fetch utility with Firebase tokens
│       └── firebase.js         # Firebase Client SDK initialization
├── .env.example                # Environment variables template
├── jsconfig.json               # Path alias configuration (@/*)
├── next.config.js              # Next.js configuration with remotePatterns
└── package.json                # Dependencies & scripts
```

---

## 🌟 Core Frontend Highlights

### 1. 📱 Responsive Modern App Shell
- **Desktop Sidebar Navigation (>= 1024px)**: Left-docked glassmorphism sidebar with quick links, unread notification counter, and theme switcher.
- **Mobile Bottom Navigation (< 1024px)**: Compact bottom bar optimized for one-handed mobile navigation.
- **Right Utility Rail**: Real-time Suggested Accounts with 1-click profile view and Trending Hashtag pills.

### 2. ⚡ 0ms Optimistic UI & Tactile Micro-Animations
- **Optimistic Voting**: Upvote / downvote counters update instantaneously with spring bounce transitions.
- **Instant Bookmark**: Star badges toggle immediately without waiting for server response.
- **Optimistic Follow / Unfollow**: Instant creator follow toggle with live count adjustment.
- **Framer Motion Micro-Interactions**: Scale, hover lift, and click compression across buttons, cards, and tabs.

### 3. 👥 Profile Viewing System
- **View-Only Mode**: Clean viewing mode for browsing other creators' profiles without exposing edit actions or private saved bookmarks.
- **Dynamic Identification**: Supports profile lookup by either user email or unique ID (`/profile?email=...` or `/profile?id=...`).
- **Interactive Commenters**: Comment authors and usernames link directly to their public profile pages.

### 4. 🔍 Live Debounced Search
- **80ms Debounce**: High-speed live search querying creators and communities with zero UI stutter.
- **Smart Blur Protection**: Prevents search dropdown from prematurely closing during click transitions.

### 5. 🖼️ Instagram 4:3 Aspect Ratio
- **Consistent Visual Presentation**: All post cards, previews, and single detail pages maintain a clean 4:3 media aspect ratio.

---

## ⚡ Getting Started

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Create `.env` in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

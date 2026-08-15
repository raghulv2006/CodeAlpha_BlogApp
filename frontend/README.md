# 🚀 BotBlogs — Frontend Documentation

Welcome to the frontend codebase documentation for **BotBlogs**, a modern, full-stack, Instagram/Reddit-inspired blogging and media platform built with **Next.js 14 (App Router)**, **React 18**, **Framer Motion**, **SWR**, **Firebase Authentication**, and **Vanilla CSS Modules**.

---

## 📁 Detailed Directory Structure

```micro-tree
frontend/
├── public/                     # Static media assets & category icons
├── src/
│   ├── app/                    # Next.js 14 App Router Pages & Layouts
│   │   ├── blog/               # Category & tag filtered feed page
│   │   │   ├── blogPage.module.css
│   │   │   └── page.jsx
│   │   ├── login/              # Login & authentication page
│   │   │   ├── loginPage.module.css
│   │   │   └── page.jsx
│   │   ├── posts/[slug]/       # Single post detail view page
│   │   │   ├── page.jsx
│   │   │   └── singlePage.module.css
│   │   ├── posts/[slug]/edit/  # Edit existing post page (Author-Protected)
│   │   │   └── page.jsx
│   │   ├── profile/            # User profile, photo manager, stats & posts
│   │   │   ├── page.jsx
│   │   │   └── profile.module.css
│   │   ├── write/              # Multi-step media-first post composer
│   │   │   └── page.jsx
│   │   ├── globals.css         # Global CSS variables & eye-friendly design system
│   │   ├── homepage.module.css # Styles for landing page
│   │   ├── layout.js           # Root layout wrapping Context Providers
│   │   └── page.jsx            # Home page (Main Feed with Server Prefetching)
│   ├── components/             # Reusable UI Components
│   │   ├── authLinks/          # Auth status links & mobile drawer
│   │   │   ├── AuthLinks.jsx
│   │   │   └── authLinks.module.css
│   │   ├── card/               # Instagram-style post card with voting & @username handles
│   │   │   ├── Card.jsx
│   │   │   └── card.module.css
│   │   ├── cardList/           # Main feed container with SWR & initial hydration
│   │   │   ├── CardList.jsx
│   │   │   └── cardList.module.css
│   │   ├── categoryList/       # Horizontal community category filter bar
│   │   │   ├── CategoryList.jsx
│   │   │   └── categoryList.module.css
│   │   ├── comments/           # Interactive post comments section
│   │   │   ├── Comments.jsx
│   │   │   └── comments.module.css
│   │   ├── editArticleButton/  # Author-only conditional post edit button
│   │   │   └── EditArticleButton.jsx
│   │   ├── featured/           # Hero welcome banner for first-time visitors
│   │   │   ├── Featured.jsx
│   │   │   └── featured.module.css
│   │   ├── footer/             # Global footer component with clean category links
│   │   │   ├── Footer.jsx
│   │   │   └── footer.module.css
│   │   ├── Menu/               # Sidebar widget for trending picks
│   │   │   ├── Menu.jsx
│   │   │   └── menu.module.css
│   │   ├── menuCategories/     # Quick category chips sidebar widget
│   │   │   ├── MenuCategories.jsx
│   │   │   └── menuCategories.module.css
│   │   ├── menuPosts/          # Dynamic trending posts widget
│   │   │   ├── MenuPosts.jsx
│   │   │   └── menuPosts.module.css
│   │   ├── navbar/             # Top navigation bar with live search
│   │   │   ├── Navbar.jsx
│   │   │   └── navbar.module.css
│   │   ├── pagination/         # Feed pagination controls
│   │   │   ├── Pagination.jsx
│   │   │   └── pagination.module.css
│   │   ├── postComposer/       # Instagram-style multi-step media composer
│   │   │   ├── PostComposer.jsx
│   │   │   └── postComposer.module.css
│   │   ├── singlePostMedia/    # Shared element media morph container
│   │   │   └── SinglePostMedia.jsx
│   │   ├── skeleton/           # Shimmer loading skeleton cards
│   │   │   ├── SkeletonCard.jsx
│   │   │   └── skeleton.module.css
│   │   └── themeToggle/        # Dark / Light theme toggle switch
│   │       ├── ThemeToggle.jsx
│   │       └── themeToggle.module.css
│   ├── context/                # React Context State Management
│   │   ├── AuthContext.jsx     # Firebase Auth Context shim
│   │   └── ThemeContext.jsx    # Light/Dark Theme Context with eye-flash protection
│   ├── providers/              # Higher-Order Provider Wrappers
│   │   ├── AuthProvider.jsx    # Auth Provider wrapper
│   │   └── ThemeProvider.jsx   # Theme Provider wrapper (SSR flash guard)
│   └── utils/                  # Helper Utilities
│       └── firebase.js         # Firebase Client SDK initialization
├── .env.example                # Environment variables template
├── jsconfig.json               # Path alias configuration (@/*)
├── next.config.js              # Next.js configuration with remotePatterns
└── package.json                # Dependencies & scripts
```

---

## 🌟 Key Features & Updates

### 1. 🖼️ Instagram 4:3 Aspect Ratio & `@username` Handles
- **Instagram Media Dimensions**: All post preview media in feeds, single detail pages, inline article images/videos, and post composer previews strictly enforce a **4:3 aspect ratio** (`aspect-ratio: 4 / 3; object-fit: cover;`) capped at `640px` max-width.
- **Instagram User Handles**: Replaced legacy Reddit-style `u/username` formatting with clean Instagram `@username` handles across post cards, single post pages, comment threads, and profile tabs.

### 2. 🔐 Author-Only Post Editing Security
- **Conditional Edit Buttons**: Rendered via `EditArticleButton.jsx`, displaying the "✏️ Edit Article" option **only** when the signed-in user's email matches the post author's email (`session.user.email === post.userEmail`).
- **Protected Edit Routes (`/posts/[slug]/edit`)**: Guarded by an inline access control validation displaying an `⛔ Access Denied` view if unauthorized users navigate directly via URL.

### 3. 📸 Google Sync & Custom Profile Photo Uploads
- **Google Account Photo Sync**: Automatically retrieves and renders the user's `session.user.image` from Firebase Google Authentication.
- **Profile Photo Uploader**: Embedded in the Edit Profile modal:
  - **File Upload**: Direct device file picker uploading images to Cloudinary.
  - **URL Input**: Option to paste any custom image URL.
  - **Google Photo Reset**: Option to instantly reset to the user's Google Account photo.
  - **Live Preview**: Real-time circular avatar preview inside the modal before saving.

### 4. 🏷️ Clean Community Formatting & Post Composer Pills
- **Prefix Removal & Capitalization**: Stripped legacy `r/` prefixes and capitalized all community names (`Coding`, `Technology`, `Gaming`, `Style`, `Fashion`, `Food`, `Travel`, `Culture`, `Entertainment`, `News`).
- **Interactive Community Selector**: Post creation page (`PostComposer.jsx`) renders system default communities alongside user-created communities with interactive pill buttons and custom `User` badges.

### 5. 👁️ Eye-Friendly Rich Light Theme System
- **Glare-Free Palette**: Default `:root` styling features a soft warm Slate-50 off-white (`#f8fafc`), crisp white card surfaces (`#ffffff`), deep Slate-900 typography (`#0f172a`), and Emerald-600 accents (`#059669`).
- **Zero Eye-Flash SSR Guard**: Pre-hydration fallback in `ThemeProvider.jsx` set to `light`, preventing jarring dark-to-light screen flashes on initial page load.
- **Smooth Theme Transitions**: Applied global CSS transitions (`0.25s ease`) for seamless background and color switches.

### 6. 🟢/🔴 Dynamic Follow / Unfollow Button Interaction
- **Not Following (`+ Follow`)**: Solid green button with vibrant green glow on hover (`#16a34a`).
- **Already Following (`✓ Following`)**: Green outline button that dynamically transforms into a red button displaying **`✕ Unfollow`** with red border (`#ef4444`) on mouse hover.

### 7. 🔗 Universal Article Card Navigation
- **Clickable Cards**: Clicking post preview images, titles, description snippets, or the `Read Article →` button instantly navigates to the read article page (`/posts/[slug]`).

---

## ⚡ Getting Started

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000"
   NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_app.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access application at **`http://localhost:3000`**.

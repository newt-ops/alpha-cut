# 🎬 ALPHA CUT — High-Impact Video Editing Agency Platform & Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154.svg?logo=reactquery)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v4-443E38.svg)](https://zustand-demo.pmnd.rs/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-Mini_App-26A5E4.svg?logo=telegram)](https://core.telegram.org/bots/webapps)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

> **"Editing is the leverage point, not an afterthought."**

**Alpha Cut** is a boutique, retention-driven video editing agency's portfolio, client-management, and operations platform founded and run by **Amir** (Video Editor) and **Aymen** (Full-Stack Developer & Video Editor). The platform pairs a high-conversion client site with an ERP-style operating system, custom Telegram Bot, and Telegram Mini App workspace.

---

## 🌟 Architecture Highlights

### ⚡ Upgraded Engineering Stack
- **TypeScript Strict Mode**: Fully typed frontend data layer with interfaces for `User`, `Project`, `Contract`, `Deliverable`, `RatingItem`, `PortfolioItem`, and `AdminStats`.
- **TanStack Query v5 Server State**: Replaced manual `fetch` & `useState` with Query caching, background refetching, and automatic mutation invalidation for real-time CRM updates.
- **Zustand Client UI State**: Lightweight state stores (`useThemeStore`, `useUIStore`) managing light/dark theme attributes, active modals, and currency selection (`ETB` / `USD`).
- **Tailwind CSS Utility Mapping**: Custom CSS custom variables (`#451D13` deep maroon, `#FBEFE1` warm cream, `#C9A06B` gold) mapped directly into Tailwind theme extensions. Zero visual style drift.
- **Chart.js Financial Analytics**: Multi-currency revenue visualization (ETB & USD), retainer breakdown, client CRM leaderboards, and conversion analytics.

---

## 🏗️ System Architecture Flow Diagram

```
                              ┌──────────────────────────────────┐
                              │         CLIENT VISITORS          │
                              └────────────────┬─────────────────┘
                                               │
                                ┌──────────────▼──────────────┐
                                │   React 18 + Vite Frontend  │
                                │ (TypeScript + Tailwind CSS) │
                                └──────────────┬──────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               │                               │                               │
 ┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐   ┌─────────────▼─────────────┐
 │   Public Landing & Cards  │   │     Client Dashboard      │   │     Admin Control Center  │
 │ (Before/After, Estimator) │   │ (Proposals & Deliverables) │   │ (CRM Stats, Chart.js)     │
 └─────────────┬─────────────┘   └─────────────┬─────────────┘   └─────────────┬─────────────┘
               │                               │                               │
               └───────────────────────────────┼───────────────────────────────┘
                                               │
                                ┌──────────────▼──────────────┐
                                │     Node.js + Express API   │
                                │ (JWT, Zod, Helmet Security) │
                                └──────┬───────────────┬──────┘
                                       │               │
                 ┌─────────────────────┴──┐         ┌──┴─────────────────────┐
                 │  Telegram Bot Engine   │         │    MongoDB Atlas DB    │
                 │ (Telegraf + Mini App)  │         │ (Projects, Contracts)  │
                 └────────────────────────┘         └────────────────────────┘
```

---

## 🌟 Core Feature Suite

### 1. Interactive Public Platform
- **Before/After Split Comparison Slider**: Interactive video comparison showing raw footage vs. retention-driven kinetic edits (sound design, kinetic typography, color grading).
- **Categorized Editing Styles**: Showcase featuring 5 signature styles: *Viral Animation Breakdowns*, *Cinematic Short-Film*, *SaaS Animations*, *David Jota Hook Style*, and *Ali Abdaal Storytelling Style*.
- **Filterable Portfolio Showcase**: 9:16 vertical `PhoneFrame` and 16:9 widescreen video preview cards with subtle 3D hover perspective tilt.
- **3-Tier Pricing & Calculator**: Basic, Professional, and Premium rate comparison, default ETB currency, and interactive frequency investment estimator (`videos/month × per-video rate range`).
- **Paginated Testimonials**: Aggregate Overview Card with star distribution bars and "Load More Reviews" incremental pagination.

### 2. Client Portal & Onboarding
- **Multi-Method Auth**: Email/password registration with 6-digit OTP verification via Resend HTML templates, plus Google OAuth integration.
- **Dual-Path Telegram Linking**: Link web account via `/link <code>` OR one-click `https://t.me/Alphacut_co_bot?start=<token>` deep links.
- **Client Workspace**: Milestone stepper (`proposal_sent` → `in_progress` → `delivered` → `completed`), project detail viewer, deliverable reviewer, and 5-star review submission modal.

### 3. Admin Control Panel
- **Financial Analytics**: Multi-currency revenue stat cards (ETB & USD), active retainer contract metrics, status breakdown, and Chart.js trend charts.
- **Proposal Builder**: Registered client typeahead search, style selector, length & tier toggles, currency select + price input, custom datepicker deadline, and brief notes.
- **Retainer Contracts Directory**: Monthly retainer allocations, handed-over deliverable video manager, and deliverable approval tracking.
- **Portfolio CMS & Moderation**: Modal thumbnail uploader with XHR progress bars, unhide/hide review moderation, and hard-delete review confirmation modal.

### 4. Telegram Bot & Mini App Integration
- **Telegraf Bot Commands**: `/start`, `/menu`, `/status`, `/projects`, `/packages`, `/styles`, `/link`, `/unlink`, `/help`.
- **Role-Aware Keyboard Navigation**: Asymmetric menus for Admin (CRM metrics, proposal builder) vs Client (active projects, deliverable approvals).
- **Telegram Mini App Workspace**: Native WebApp SDK integration with haptic feedback, dark theme, quick proposal acceptance, and deliverable render viewer.

---

## 📁 Directory Structure

```
c:/Alpha Cut/Web App/
├── frontend/                  # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/         # AdminHeaderBar, AnalyticsCharts, AdminSectionHeader
│   │   │   ├── auth/          # RequireAuth & RequireAdmin route guards
│   │   │   ├── calendar/      # NotionCalendar component
│   │   │   ├── home/          # BeforeAfterComparison interactive slider
│   │   │   ├── icons/         # icons.jsx centralized SVG system (zero emojis)
│   │   │   ├── layout/        # Navbar, Footer, PageWrapper, ErrorBoundary, TelegramAppLayout
│   │   │   ├── media/         # PhoneFrame (9:16) & VideoFrame (16:9)
│   │   │   └── ui/            # UI primitives (Button, Input, Modal, CurrencyToggle, Dropzone, etc.)
│   │   ├── context/           # AuthContext & ThemeContext
│   │   ├── data/              # Canonical editing styles, portfolio & package data
│   │   ├── hooks/             # TanStack Query hooks (useProjects, useContracts, useRatings, etc.)
│   │   ├── pages/             # Pages (Home, Styles, Portfolio, Packages, About, Dashboard, Admin, MiniApp)
│   │   ├── stores/            # Zustand stores (useThemeStore, useUIStore)
│   │   ├── styles/            # tokens.css & globals.css (Tailwind directives & custom tokens)
│   │   ├── types/             # Strict TypeScript interface declarations (index.ts)
│   │   ├── App.tsx            # Lazy-loaded QueryClient router configuration
│   │   └── main.tsx           # Application entry point
│   ├── tailwind.config.js     # Tailwind CSS theme configuration
│   ├── vite.config.ts         # Vite TypeScript configuration
│   ├── tsconfig.json          # TypeScript compiler options & path aliases
│   └── package.json
├── backend/                   # Express API & Telegram Bot Engine (TypeScript)
│   ├── src/
│   │   ├── bot/               # Telegraf Telegram bot commands, keyboards, handlers & notifications (.ts)
│   │   ├── config/            # Environment loader & validation (.ts)
│   │   ├── controllers/       # Auth, Admin, Project, Contract, Rating, Notification controllers (.ts)
│   │   ├── middleware/        # Auth, Admin, CSRF, Helmet CSP, Zod validation, Error Handler (.ts)
│   │   ├── models/            # User, Project, Contract, Rating, PackageConfig, PendingLink, Notification (.ts)
│   │   ├── routes/            # API routes (/api/auth, /api/admin, /api/projects, /api/contracts, etc.) (.ts)
│   │   ├── services/          # Lifecycle Engine, Email Service, Telegram Bot Service, Cloudinary Service (.ts)
│   │   └── server.ts          # Express app entry point (TypeScript)
│   ├── tsconfig.json          # NodeNext TypeScript compiler configuration
│   └── package.json
└── README.md                  # Master repository documentation
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/alphacut?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
RESEND_API_KEY=your_resend_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=@alphacut_co_bot
TELEGRAM_WEBHOOK_SECRET=your_telegram_webhook_secret_here
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run Type Checks & Local Servers
```bash
# Type-check frontend
cd frontend
npx tsc --noEmit

# Start Backend API (Port 5000)
cd ../backend
npm run dev

# Start Frontend Vite Dev Server (Port 5173)
cd ../frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 👤 Agency Founders & Developer Credit

- **Amir** — Co-Founder & Video Editor (`alphacutagency@gmail.com`)
- **Aymen** — Co-Founder, Full-Stack Developer & Video Editor (`alphacutagency@gmail.com`)

Crafted with engineering excellence by [aymen10.netlify.app](https://aymen10.netlify.app).

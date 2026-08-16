# 🎬 ALPHA CUT — Creative Video Editing Agency & Client Management System

![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)
![Frontend: React 18 + Vite](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-maroon.svg)
![Backend: Express + MongoDB](https://img.shields.io/badge/Backend-Node.js_%2B_Express_%2B_MongoDB-170B06.svg)
![Bot: Telegraf Telegram Bot](https://img.shields.io/badge/Bot-Telegraf_Telegram_API-0088cc.svg)

> **"Editing is the leverage point, not an afterthought."**

**Alpha Cut** is a high-impact, retention-focused video editing agency platform founded by **Amir** (Video Editor) and **Aymen** (Full-Stack Developer & Video Editor). The web application combines an interactive portfolio teaching visitors the leverage of retention-driven video edits with an ERP-style client management portal, proposal builder, and Telegram bot notification service.

---

## 🌟 Key Features

### 1. Interactive Public Platform
- **"Why Editing Matters" Interactive Scroll Sequence**: Features a real-time **Before/After Split Comparison Slider** demonstrating raw footage vs. retention-driven kinetic edits (captions, motion graphics, sound design, color grading).
- **Categorized Editing Styles Catalog**: Interactive showcase seeded with 5 signature styles: *Viral Animation Breakdowns*, *Cinematic Short-Film*, *SaaS Animations*, *David Jota Hook Style*, and *Ali Abdaal Storytelling Style*.
- **Filterable Portfolio Showcase**: Custom 9:16 vertical `PhoneFrame` and 16:9 widescreen `VideoFrame` device components with subtle 3D hover perspective tilt.
- **Packages & Monthly Frequency Calculator**: Basic vs. Premium rate comparison, USD/ETB toggle, and an interactive calculator computing monthly investment ranges (`videos/month × per-video rate range`).
- **About Founders & Verified Reviews**: Interactive dual-profile presentation for Amir and Aymen, plus live public ratings powered by database reviews.

### 2. Client Portal & Onboarding
- **Multi-Method Auth**: Local email/password registration with 6-digit OTP verification via Resend HTML templates, plus Google OAuth integration.
- **Telegram Account Linking**: Dual-path onboarding via manual `/link <code>` OR one-click `https://t.me/<BotUsername>?start=<token>` deep links.
- **Client Dashboard**: Stepper timeline (`proposal_sent` → `in_progress` → `delivered` → `completed`), project detail viewer, deliverable reviewer, and 5-star review submission modal.

### 3. Admin Control Panel
- **Revenue & Analytics**: Separate USD and ETB revenue stat cards (no FX conversions), registered client count, status breakdown, average rating, and recent activity feed.
- **Proposal Builder**: Typeahead registered client search (blocks submission for unregistered emails), style select, length & tier toggles, currency select + price input, custom popover `DatePicker` for deadline, and brief notes.
- **Project Board & Delivery**: Status board with "Mark Delivered" action attaching external project links (Google Drive, Frame.io, Dropbox).
- **Ratings Moderation & Pricing Config**: Moderation toggles to hide/unhide public reviews, plus a package pricing range editor.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Framer Motion, Lucide Icons |
| **Styling** | Modular Vanilla CSS Design Tokens (Warm Cream `#FBEFE1`, Maroon `#451D13`, Gold `#C9A06B`), Light/Dark mode |
| **Backend API** | Node.js, Express, Mongoose, Zod validation, Helmet CSP, CSRF protection, HPP, Cookie Parser |
| **Database** | MongoDB Atlas |
| **Telegram Bot** | Telegraf Webhook service running on the same Express service |
| **Transactional Email** | Resend API |
| **Media Storage** | Cloudinary (avatar profile photos) |
| **Hosting** | Netlify (Frontend SPA) + Render (Backend Web Service + Telegram Bot) |

---

## 📁 Repository Structure

```
alpha-cut/
├── frontend/                  # React + Vite client application
│   ├── public/
│   │   └── _redirects         # Netlify SPA route fallback
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # RequireAuth & RequireAdmin route guards
│   │   │   ├── home/          # BeforeAfterComparison interactive slider
│   │   │   ├── icons/         # icons.jsx centralized SVG system (zero emojis)
│   │   │   ├── layout/        # Navbar, Footer, PageWrapper
│   │   │   ├── media/         # PhoneFrame (9:16) & VideoFrame (16:9)
│   │   │   └── ui/            # 18 Custom UI primitives (Button, Input, DatePicker, etc.)
│   │   ├── context/           # ThemeContext & AuthContext
│   │   ├── data/              # Canonical editing styles, portfolio & package data
│   │   ├── pages/             # Sitemap pages (Home, Styles, Portfolio, Packages, About, Dashboard, Admin, etc.)
│   │   ├── styles/            # tokens.css & globals.css
│   │   ├── App.jsx            # Lazy-loaded router configuration
│   │   └── main.jsx
│   ├── vite.config.js         # Path aliases (@components, @pages, @icons, etc.)
│   └── package.json
├── backend/                   # Express API & Telegram Bot
│   ├── src/
│   │   ├── config/            # Environment loader & validation
│   │   ├── controllers/       # Auth, Admin, Project, Rating, Notification controllers
│   │   ├── middleware/        # Auth, Admin, CSRF, Helmet CSP, Zod validation, Error Handler
│   │   ├── models/            # User, Project, Rating, PackageConfig, PendingLink, Notification
│   │   ├── routes/            # API routes (/api/auth, /api/admin, /api/projects, /api/telegram, etc.)
│   │   ├── services/          # Lifecycle Engine, Email Service, Telegram Bot Service, Cloudinary Service
│   │   ├── utils/             # seedAdmin.js & setTelegramWebhook.js CLI tools
│   │   └── server.js          # Express app entry point
│   └── package.json
├── PROJECT_BRIEF.md           # Canonical master project brief
├── README.md                  # System documentation
└── LICENSE                    # MIT License
```

---

## 🔑 Environment Variables Reference

Create `.env` in `backend/` and `frontend/` matching the required variables:

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
TELEGRAM_BOT_USERNAME=@alpha_cut_bot
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

### 1. Clone & Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Seed Initial Admin Account
Run the CLI seed script to generate your admin credentials in MongoDB Atlas:
```bash
cd backend
node src/utils/seedAdmin.js alphacutagency@gmail.com YourStrongPassword! "Aymen Admin"
```

### 3. Start Local Servers
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🚀 Deployment Instructions

### 1. Backend Service (Render)
- Deploy `backend/` as a single Render **Web Service**.
- Build Command: `npm install`
- Start Command: `node src/server.js`
- Set all backend environment variables in Render's environment dashboard.
- Set `CLIENT_URL` to your production Netlify URL.

### 2. Telegram Bot Webhook Registration
After your Render Web Service is live, register the Telegram Webhook:
```bash
cd backend
node src/utils/setTelegramWebhook.js https://your-service.onrender.com
```

### 3. Frontend Client (Netlify)
- Deploy `frontend/` to Netlify.
- Build Command: `npm run build`
- Publish Directory: `frontend/dist`
- Set `VITE_API_URL` to your live Render backend URL.
- The included `public/_redirects` file ensures single-page client routing (`/* /index.html 200`).

---

## 👤 Agency Founders & Developer Credit

- **Amir** — Co-Founder & Video Editor (`alphacutagency@gmail.com`)
- **Aymen** — Co-Founder, Full-Stack Developer & Video Editor (`alphacutagency@gmail.com`)

Crafted with engineering excellence by [aymen10.netlify.app](https://aymen10.netlify.app).

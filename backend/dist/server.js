import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { config, validateEnv } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import authRoutes from './routes/auth.routes.js';
import telegramRoutes from './routes/telegram.routes.js';
import projectRoutes from './routes/project.routes.js';
import adminRoutes from './routes/admin.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import contractRoutes from './routes/contract.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import { getAllPackageConfigs, getLiveExchangeRate } from './controllers/admin.controller.js';
validateEnv();
const app = express();
app.set('trust proxy', 1);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://apis.google.com'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com', 'https://*.googleusercontent.com'],
            connectSrc: ["'self'", 'https://accounts.google.com', 'https://api.cloudinary.com', 'https://api.alpha-cut.com', 'https://alpha-cut.onrender.com'],
            frameSrc: ["'self'", 'https://accounts.google.com', 'https://www.youtube.com', 'https://player.vimeo.com'],
        },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = [
    config.clientUrl,
    'https://alpha-cut.com',
    'https://www.alpha-cut.com',
    'https://app.alpha-cut.com',
    'https://dashboard.alpha-cut.com',
    'https://admin.alpha-cut.com',
    'https://api.alpha-cut.com',
    'https://alpha-cut-nine.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());
app.use(csrfProtection);
// Granular Rate Limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Upload signature limit reached. Please try again later.' },
});
app.use(generalLimiter);
// Specific Rate Limits
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/uploads/signed-url', uploadLimiter);
app.use('/api/v1/uploads/signed-url', uploadLimiter);
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}
// Versioned & Unversioned API Routes (Backwards compatible)
const routePairs = [
    ['auth', authRoutes],
    ['telegram', telegramRoutes],
    ['projects', projectRoutes],
    ['admin', adminRoutes],
    ['ratings', ratingRoutes],
    ['notifications', notificationRoutes],
    ['uploads', uploadRoutes],
    ['portfolio', portfolioRoutes],
    ['payments', paymentRoutes],
];
routePairs.forEach(([path, handler]) => {
    app.use(`/api/v1/${path}`, handler);
    app.use(`/api/${path}`, handler);
});
app.use('/api/v1/admin/invoices', invoiceRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api/v1', contractRoutes);
app.use('/api', contractRoutes);
app.get(['/api/v1/packages/exchange-rate', '/api/packages/exchange-rate'], getLiveExchangeRate);
app.get(['/api/v1/packages', '/api/packages'], getAllPackageConfigs);
// Health Check Endpoints
app.get(['/api/health', '/api/v1/health'], (req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
    res.status(200).json({
        status: 'ok',
        version: '1.0.0',
        service: 'Alpha Cut API',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        database: dbState,
    });
});
app.get(['/api/health/live', '/api/v1/health/live'], (req, res) => {
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});
app.get(['/api/health/ready', '/api/v1/health/ready'], (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    if (isReady) {
        res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
    }
    else {
        res.status(503).json({ status: 'degraded', reason: 'Database connection establishing' });
    }
});
// Interactive API Documentation Route (/docs)
app.get('/docs', (req, res) => {
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alpha Cut — Developer API Documentation</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        :root {
          --bg: #15120d;
          --surface: #1e1a14;
          --surface-sunk: #0e0c08;
          --line: #332d23;
          --line-strong: #4a4234;
          --ink: #f6f1e5;
          --ink-body: #ddd6c6;
          --ink-soft: #968c78;
          --gold: #e5b874;
          --green: #2fb98d;
          --blue: #38bdf8;
          --red: #f43f5e;
          --font-mono: 'IBM Plex Mono', monospace;
          --font-sans: 'Inter', system-ui, sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--font-sans);
          background-color: var(--bg);
          color: var(--ink-body);
          line-height: 1.5;
          min-height: 100vh;
          padding: 32px 20px;
        }

        .container { max-width: 1000px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid var(--line); margin-bottom: 30px; }
        .title { font-size: 20px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 10px; }
        .back-link { font-family: var(--font-mono); font-size: 13px; color: var(--gold); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }

        .search-bar { width: 100%; padding: 12px 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; color: var(--ink); font-family: var(--font-mono); font-size: 13px; margin-bottom: 24px; outline: none; }
        .search-bar:focus { border-color: var(--gold); }

        .doc-card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
        .endpoint-tag { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 10px; }
        
        .method { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); text-transform: uppercase; }
        .method-get { background: rgba(56, 189, 248, 0.15); color: var(--blue); border: 1px solid rgba(56, 189, 248, 0.3); }
        .method-post { background: rgba(47, 185, 141, 0.15); color: var(--green); border: 1px solid rgba(47, 185, 141, 0.3); }

        .desc { font-size: 13px; color: var(--ink-soft); margin-bottom: 12px; }
        .code-block { background: var(--surface-sunk); border: 1px solid var(--line); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 12px; color: var(--gold); overflow-x: auto; white-space: pre-wrap; }
        .btn-test { background: var(--surface-sunk); border: 1px solid var(--line); color: var(--ink); font-family: var(--font-mono); font-size: 11px; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
        .btn-test:hover { border-color: var(--gold); color: var(--gold); }
        .term { display: none; margin-top: 12px; background: var(--surface-sunk); border: 1px solid var(--line); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 12px; color: #a6accd; }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <div class="title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
            Alpha Cut REST API Specification v1.0
          </div>
          <a href="/" class="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Platform
          </a>
        </header>

        <input type="text" id="docSearch" class="search-bar" placeholder="Filter API endpoints (e.g. /api/v1/auth)..." onkeyup="filterDocs()" />

        <!-- Endpoints List -->
        <div id="docList">
          
          <div class="doc-card" data-search="/api/v1/health get system status">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/health</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/health', 't-health')">Run Request</button>
            </div>
            <div class="desc">System health check endpoint. Returns API operational state and uptime.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/health"</div>
            <div id="t-health" class="term"></div>
          </div>

          <div class="doc-card" data-search="/api/v1/packages get pricing retainers">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/packages</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/packages', 't-pkg')">Run Request</button>
            </div>
            <div class="desc">Public endpoint returning agency package tiers, ETB/USD rates, and feature breakdown.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/packages"</div>
            <div id="t-pkg" class="term"></div>
          </div>

          <div class="doc-card" data-search="/api/v1/auth/me get profile user session">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/auth/me</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/auth/me', 't-me')">Run Request</button>
            </div>
            <div class="desc">Fetch active authenticated user session details, role, and avatar.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/auth/me" -H "Cookie: token=YOUR_JWT"</div>
            <div id="t-me" class="term"></div>
          </div>

          <div class="doc-card" data-search="/api/v1/projects get client video editing pipeline">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/projects</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/projects', 't-proj')">Run Request</button>
            </div>
            <div class="desc">Retrieves list of active client video editing projects and status pipeline.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/projects"</div>
            <div id="t-proj" class="term"></div>
          </div>

          <div class="doc-card" data-search="/api/v1/portfolio get video samples showcase">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/portfolio</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/portfolio', 't-port')">Run Request</button>
            </div>
            <div class="desc">Retrieves curated agency portfolio items, streaming URLs, and thumbnails.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/portfolio"</div>
            <div id="t-port" class="term"></div>
          </div>

          <div class="doc-card" data-search="/api/v1/ratings get reviews testimonials">
            <div class="doc-header">
              <div class="endpoint-tag">
                <span class="method method-get">GET</span>
                <span>/api/v1/ratings</span>
              </div>
              <button class="btn-test" onclick="runTest('/api/v1/ratings', 't-rate')">Run Request</button>
            </div>
            <div class="desc">Fetches verified client reviews, star ratings, and testimonials.</div>
            <div class="code-block">curl -X GET "https://api.alpha-cut.com/api/v1/ratings"</div>
            <div id="t-rate" class="term"></div>
          </div>

        </div>
      </div>

      <script>
        async function runTest(url, termId) {
          const term = document.getElementById(termId);
          if (!term) return;
          term.style.display = 'block';
          term.innerHTML = 'Executing request to ' + url + '...';
          try {
            const start = performance.now();
            const res = await fetch(url);
            const duration = Math.round(performance.now() - start);
            const data = await res.json();
            term.innerHTML = '<div style="color: var(--green); margin-bottom: 6px; font-weight: 600;">Status ' + res.status + ' OK (' + duration + 'ms)</div>' + JSON.stringify(data, null, 2);
          } catch (e) {
            term.innerHTML = '<div style="color: var(--red);">Error: ' + e.message + '</div>';
          }
        }

        function filterDocs() {
          const q = document.getElementById('docSearch').value.toLowerCase();
          document.querySelectorAll('.doc-card').forEach(card => {
            const text = card.getAttribute('data-search') || '';
            card.style.display = text.toLowerCase().includes(q) ? 'block' : 'none';
          });
        }
      </script>
    </body>
    </html>
  `);
});
// Clean Public API Landing Page (Root Route /)
app.get('/', (req, res) => {
    const nodeEnv = config.nodeEnv || 'production';
    const timestamp = new Date().toISOString();
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alpha Cut — Developer Platform & API Services</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        :root {
          --bg: #15120d;
          --surface: #1e1a14;
          --surface-sunk: #0e0c08;
          --line: #332d23;
          --line-strong: #4a4234;
          --ink: #f6f1e5;
          --ink-body: #ddd6c6;
          --ink-soft: #968c78;
          --gold: #e5b874;
          --green: #2fb98d;
          --blue: #38bdf8;
          --font-mono: 'IBM Plex Mono', monospace;
          --font-sans: 'Inter', system-ui, sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: var(--font-sans);
          background-color: var(--bg);
          color: var(--ink-body);
          line-height: 1.5;
          min-height: 100vh;
          padding: 40px 24px;
          -webkit-font-smoothing: antialiased;
        }

        .container { max-width: 1040px; margin: 0 auto; }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 28px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 36px;
        }
        .brand-box { display: flex; align-items: center; gap: 16px; }
        .brand-logo { width: 44px; height: 35px; object-fit: contain; }
        .brand-title { font-size: 22px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
        .brand-title span { color: var(--gold); font-style: italic; font-weight: 400; }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(47, 185, 141, 0.12);
          border: 1px solid rgba(47, 185, 141, 0.3);
          color: var(--green);
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 100px;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: var(--green);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--green);
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

        /* Quick Links */
        .quick-links { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
        }
        .btn-link:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-1px); }
        .btn-gold { background: var(--gold); color: #15120d; border-color: var(--gold); }
        .btn-gold:hover { background: #f0c988; color: #15120d; }

        /* Hero Banner */
        .hero {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 36px;
          margin-bottom: 36px;
        }
        .hero-title { font-size: 26px; font-weight: 800; color: var(--ink); margin-bottom: 8px; letter-spacing: -0.02em; }
        .hero-sub { font-size: 15px; color: var(--ink-soft); max-width: 680px; line-height: 1.6; margin-bottom: 24px; }
        
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        /* Telemetry Cards */
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
        .card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 20px; }
        .card-label { font-family: var(--font-mono); font-size: 11px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .card-val { font-size: 18px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; }

        /* Services Grid */
        .section-title { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 48px; }
        
        .service-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 24px;
          transition: all 0.15s ease;
        }
        .service-card:hover { border-color: var(--line-strong); }
        .service-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .service-name { font-size: 16px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 10px; }
        .service-route { font-family: var(--font-mono); font-size: 12px; color: var(--gold); background: var(--surface-sunk); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--line); }
        .service-desc { font-size: 13px; color: var(--ink-soft); line-height: 1.5; }

        /* Footer */
        .footer {
          padding-top: 24px;
          border-top: 1px solid var(--line);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 13px;
          color: var(--ink-soft);
        }
        .footer-links { display: flex; gap: 16px; }
        .footer-links a { color: var(--ink-soft); text-decoration: none; }
        .footer-links a:hover { color: var(--gold); }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <header class="header">
          <div class="brand-box">
            <img src="https://alpha-cut.com/alpha-logo-dark.png" alt="Alpha Cut Logo" class="brand-logo" />
            <div>
              <div class="brand-title">Alpha<span>Cut</span> API</div>
              <div style="font-size: 12px; color: var(--ink-soft); margin-top: 2px;">Developer Platform · Version 1.0</div>
            </div>
          </div>
          <div class="status-badge">
            <div class="pulse-dot"></div> OPERATIONAL
          </div>
        </header>

        <!-- Hero Section -->
        <section class="hero">
          <h1 class="hero-title">API Infrastructure for Alpha Cut</h1>
          <p class="hero-sub">Production microservices powering high-impact video editing workflows, retainer client management, automated proposal generation, and Telegram Bot services.</p>
          <div class="hero-actions">
            <a href="/docs" class="btn-link btn-gold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              API Documentation
            </a>
            <a href="/api/health" target="_blank" class="btn-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              Health Status JSON
            </a>
            <a href="https://alpha-cut.com" target="_blank" class="btn-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              Open Web App
            </a>
            <a href="https://t.me/alpha_cut_bot" target="_blank" class="btn-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              Telegram Bot
            </a>
          </div>
        </section>

        <!-- Metrics Grid -->
        <div class="grid-4">
          <div class="card">
            <div class="card-label">System Status</div>
            <div class="card-val" style="color: var(--green);">● Operational</div>
          </div>
          <div class="card">
            <div class="card-label">API Gateway</div>
            <div class="card-val" style="color: var(--gold);">v1.0.0 (Versioned)</div>
          </div>
          <div class="card">
            <div class="card-label">Security Shield</div>
            <div class="card-val" style="font-size: 15px; color: var(--blue);">CORS • CSRF • Helmet</div>
          </div>
          <div class="card">
            <div class="card-label">Environment</div>
            <div class="card-val" style="text-transform: uppercase;">${nodeEnv}</div>
          </div>
        </div>

        <!-- API Services Catalog -->
        <div class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          API Microservices & Subsystems
        </div>

        <div class="services-grid">
          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Authentication
              </div>
              <span class="service-route">/api/v1/auth</span>
            </div>
            <div class="service-desc">JWT session issuing, client registration, password reset, and Google OAuth 2.0 flow.</div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                Video Projects
              </div>
              <span class="service-route">/api/v1/projects</span>
            </div>
            <div class="service-desc">Editing project pipeline, revision history, video review links, and deliverable status.</div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Retainer Contracts
              </div>
              <span class="service-route">/api/v1/contracts</span>
            </div>
            <div class="service-desc">Proposal studio agreements, retainer contracts, monthly video quota tracking, and digital signing.</div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Telegram Gateway
              </div>
              <span class="service-route">/api/v1/telegram</span>
            </div>
            <div class="service-desc">Telegram Mini App authentication, 6-digit code account linking, and real-time bot alerts.</div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Payments & Billing
              </div>
              <span class="service-route">/api/v1/payments</span>
            </div>
            <div class="service-desc">Chapa payment gateway integration, ETB/USD invoice generation, and receipt verification.</div>
          </div>

          <div class="service-card">
            <div class="service-header">
              <div class="service-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Cloud Storage
              </div>
              <span class="service-route">/api/v1/uploads</span>
            </div>
            <div class="service-desc">Cloudinary signed upload signatures for secure high-res raw video footage uploads.</div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="footer">
          <div>Alpha Cut Agency · Production Services</div>
          <div class="footer-links">
            <a href="/docs">Documentation</a>
            <a href="/api/health">Status</a>
            <a href="https://alpha-cut.com">Main Platform</a>
          </div>
        </footer>
      </div>
    </body>
    </html>
  `);
});
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Alpha Cut API',
        timestamp: new Date().toISOString(),
        dbConnected: mongoose.connection.readyState === 1,
    });
});
app.use(errorHandler);
const startServer = async () => {
    app.listen(config.port, () => {
        console.log(`Alpha Cut Backend running on port ${config.port} [${config.nodeEnv}]`);
    });
    if (config.mongoUri) {
        try {
            await mongoose.connect(config.mongoUri);
            console.log('MongoDB connection established successfully.');
        }
        catch (err) {
            console.error('MongoDB connection error:', err.message);
        }
    }
};
startServer();

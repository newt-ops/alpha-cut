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
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());
app.use(csrfProtection);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    },
}));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
}
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/invoices', invoiceRoutes);
app.use('/api', contractRoutes);
app.get('/api/packages/exchange-rate', getLiveExchangeRate);
app.get('/api/packages', getAllPackageConfigs);
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting';
    const nodeEnv = config.nodeEnv || 'production';
    const timestamp = new Date().toISOString();
    res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alpha Cut — Developer API & Microservices Engine</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        :root {
          --bg: #15120d;
          --surface: #1e1a14;
          --surface-sunk: #0e0c08;
          --surface-hover: #26211a;
          --line: #332d23;
          --line-strong: #4a4234;
          --ink: #f6f1e5;
          --ink-body: #ddd6c6;
          --ink-soft: #968c78;
          --gold: #e5b874;
          --gold-dark: #9a6a2c;
          --green: #2fb98d;
          --blue: #38bdf8;
          --purple: #c084fc;
          --red: #f43f5e;
          --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
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
          -webkit-font-smoothing: antialiased;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Top Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 32px;
        }
        .brand-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .brand-logo {
          width: 44px;
          height: 35px;
          object-fit: contain;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .brand-title span {
          color: var(--gold);
          font-style: italic;
          font-weight: 400;
        }
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
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }

        /* Top Nav Quick Action Links */
        .quick-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
        }
        .btn-link:hover {
          border-color: var(--gold);
          color: var(--gold);
          transform: translateY(-1px);
        }
        .btn-gold {
          background: var(--gold);
          color: #15120d;
          border-color: var(--gold);
        }
        .btn-gold:hover {
          background: #f0c988;
          color: #15120d;
        }

        /* Hero Status Telemetry Grid */
        .telemetry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 36px;
        }
        .telemetry-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 20px;
        }
        .telemetry-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 6px;
        }
        .telemetry-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Section Headings */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--ink);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Search Filter Input */
        .search-box {
          background: var(--surface-sunk);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 8px 16px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--ink);
          width: 260px;
          outline: none;
        }
        .search-box:focus {
          border-color: var(--gold);
        }

        /* Filter Chips */
        .filter-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .chip {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink-soft);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .chip.active, .chip:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: rgba(229, 184, 116, 0.1);
        }

        /* Endpoint Explorer Cards */
        .endpoint-list {
          display: grid;
          gap: 14px;
          margin-bottom: 40px;
        }
        .endpoint-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 16px 20px;
          transition: all 0.15s ease;
        }
        .endpoint-card:hover {
          border-color: var(--line-strong);
        }
        .endpoint-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .endpoint-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
        }
        .method {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .method-get { background: rgba(56, 189, 248, 0.15); color: var(--blue); border: 1px solid rgba(56, 189, 248, 0.3); }
        .method-post { background: rgba(47, 185, 141, 0.15); color: var(--green); border: 1px solid rgba(47, 185, 141, 0.3); }
        .method-put { background: rgba(229, 184, 116, 0.15); color: var(--gold); border: 1px solid rgba(229, 184, 116, 0.3); }
        .method-delete { background: rgba(244, 63, 94, 0.15); color: var(--red); border: 1px solid rgba(244, 63, 94, 0.3); }

        .path {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
        }
        .desc {
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 6px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }
        .btn-sm {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--line);
          background: var(--surface-sunk);
          color: var(--ink-body);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-sm:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        /* Live Terminal Response Box */
        .terminal-box {
          margin-top: 14px;
          background: var(--surface-sunk);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: #a6accd;
          display: none;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        /* Footer */
        .footer {
          margin-top: 48px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Top Navigation Header -->
        <header class="header">
          <div class="brand-box">
            <img src="https://alpha-cut.com/alpha-logo-dark.png" alt="Alpha Cut Logo" class="brand-logo" />
            <div>
              <div class="brand-title">Alpha<span>Cut</span> API Platform</div>
              <div style="font-size: 12px; color: var(--ink-soft); margin-top: 2px;">REST API Engine & Telegram Bot Microservices v1.0.0</div>
            </div>
          </div>
          <div class="quick-links">
            <div class="status-badge">
              <div class="pulse-dot"></div> API OPERATIONAL
            </div>
            <a href="/api/health" target="_blank" class="btn-link">🩺 Live Health JSON</a>
            <a href="https://alpha-cut.com" target="_blank" class="btn-link btn-gold">🚀 Open Main Web App</a>
            <a href="https://t.me/alpha_cut_bot" target="_blank" class="btn-link">📱 Telegram Bot</a>
          </div>
        </header>

        <!-- System Diagnostics Grid -->
        <div class="telemetry-grid">
          <div class="telemetry-card">
            <div class="telemetry-label">API Health State</div>
            <div class="telemetry-val" style="color: var(--green);">● Online & Active</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-label">Database Connection</div>
            <div class="telemetry-val" style="color: var(--gold);">${dbStatus} (MongoDB Atlas)</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-label">Environment</div>
            <div class="telemetry-val" style="text-transform: uppercase;">${nodeEnv}</div>
          </div>
          <div class="telemetry-card">
            <div class="telemetry-label">Security & Rate Limit</div>
            <div class="telemetry-val" style="font-size: 15px; color: var(--blue);">Helmet • CSRF • 300 req / 15m</div>
          </div>
        </div>

        <!-- Section Title & Filter -->
        <div class="section-header">
          <div class="section-title">
            <span>⚡ Interactive Microservices Catalog</span>
            <span style="font-size: 12px; font-family: var(--font-mono); color: var(--ink-soft); font-weight: 500;">(11 Active Route Handlers)</span>
          </div>
          <input type="text" id="searchInput" class="search-box" placeholder="Search endpoints..." onkeyup="filterEndpoints()" />
        </div>

        <!-- Category Filter Bar -->
        <div class="filter-bar">
          <button class="chip active" onclick="setFilter('all', this)">All Endpoints</button>
          <button class="chip" onclick="setFilter('auth', this)">Auth & Users</button>
          <button class="chip" onclick="setFilter('telegram', this)">Telegram Bot</button>
          <button class="chip" onclick="setFilter('projects', this)">Video Projects</button>
          <button class="chip" onclick="setFilter('contracts', this)">Retainer Contracts</button>
          <button class="chip" onclick="setFilter('ratings', this)">Reviews & Ratings</button>
          <button class="chip" onclick="setFilter('uploads', this)">Cloud Storage</button>
        </div>

        <!-- Endpoints List -->
        <div class="endpoint-list" id="endpointList">
          
          <!-- Health -->
          <div class="endpoint-card" data-category="system" data-search="/api/health get status health">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/health</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/health', 'health-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/health')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Retrieves real-time API uptime, MongoDB database status, and system timestamp.</div>
            <div id="health-term" class="terminal-box"></div>
          </div>

          <!-- Packages -->
          <div class="endpoint-card" data-category="system" data-search="/api/packages get pricing retainers">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/packages</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/packages', 'pkg-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/packages')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Fetches live pricing tiers, ETB/USD exchange rates, and retainer package features.</div>
            <div id="pkg-term" class="terminal-box"></div>
          </div>

          <!-- Auth Login -->
          <div class="endpoint-card" data-category="auth" data-search="/api/auth/login post login authenticate">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-post">POST</span>
                <span class="path">/api/auth/login</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="copyPath('/api/auth/login')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Authenticates client/admin user credentials and sets secure HTTP-only session cookies.</div>
          </div>

          <!-- Auth Me -->
          <div class="endpoint-card" data-category="auth" data-search="/api/auth/me get profile user session">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/auth/me</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/auth/me', 'me-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/auth/me')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Retrieves current session user profile, role, avatar, and connected Telegram account ID.</div>
            <div id="me-term" class="terminal-box"></div>
          </div>

          <!-- Telegram Code Verification -->
          <div class="endpoint-card" data-category="telegram" data-search="/api/telegram/verify-link-code post telegram code miniapp bot">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-post">POST</span>
                <span class="path">/api/telegram/verify-link-code</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="copyPath('/api/telegram/verify-link-code')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Validates the 6-digit linking code to connect Telegram Mini App users to dashboard accounts.</div>
          </div>

          <!-- Projects -->
          <div class="endpoint-card" data-category="projects" data-search="/api/projects get post client video editing list submit">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/projects</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/projects', 'proj-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/projects')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Lists active video editing projects, pipeline stage statuses, review links, and revision history.</div>
            <div id="proj-term" class="terminal-box"></div>
          </div>

          <!-- Retainer Contracts -->
          <div class="endpoint-card" data-category="contracts" data-search="/api/contracts get proposals retainer agreement">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/contracts</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/contracts', 'contract-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/contracts')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Fetches client retainer contracts, proposal agreements, monthly video limits, and renewal dates.</div>
            <div id="contract-term" class="terminal-box"></div>
          </div>

          <!-- Ratings & Reviews -->
          <div class="endpoint-card" data-category="ratings" data-search="/api/ratings get reviews ratings testimonials">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-get">GET</span>
                <span class="path">/api/ratings</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="testEndpoint('/api/ratings', 'rate-term')">▶ Live Run</button>
                <button class="btn-sm" onclick="copyPath('/api/ratings')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Retrieves verified client ratings, star feedback, and agency testimonials.</div>
            <div id="rate-term" class="terminal-box"></div>
          </div>

          <!-- Uploads Signature -->
          <div class="endpoint-card" data-category="uploads" data-search="/api/uploads/signed-url post cloudinary media storage">
            <div class="endpoint-header">
              <div class="endpoint-meta">
                <span class="method method-post">POST</span>
                <span class="path">/api/uploads/signed-url</span>
              </div>
              <div class="actions">
                <button class="btn-sm" onclick="copyPath('/api/uploads/signed-url')">📋 Copy Path</button>
              </div>
            </div>
            <div class="desc">Generates Cloudinary authenticated upload signatures for high-res video raw assets.</div>
          </div>

        </div>

        <!-- Footer -->
        <footer class="footer">
          <div>© 2026 Alpha Cut Agency • High-Impact Video Editing Infrastructure</div>
          <div>Server Time: <span style="font-family: var(--font-mono); color: var(--gold);">${timestamp}</span></div>
        </footer>
      </div>

      <script>
        async function testEndpoint(path, targetId) {
          const el = document.getElementById(targetId);
          if (!el) return;
          el.style.display = 'block';
          el.innerHTML = '<span style="color: var(--gold);">Fetching ' + path + '...</span>';
          
          try {
            const start = performance.now();
            const res = await fetch(path);
            const duration = Math.round(performance.now() - start);
            const data = await res.json();
            
            const statusColor = res.ok ? 'var(--green)' : 'var(--red)';
            el.innerHTML = '<div style="margin-bottom: 8px;"><span style="color:' + statusColor + '; font-weight:700;">HTTP ' + res.status + '</span> • Response Time: ' + duration + 'ms</div>' + JSON.stringify(data, null, 2);
          } catch (e) {
            el.innerHTML = '<span style="color: var(--red);">Error testing endpoint: ' + e.message + '</span>';
          }
        }

        function copyPath(path) {
          navigator.clipboard.writeText(path);
          alert('Copied to clipboard: ' + path);
        }

        function setFilter(cat, btn) {
          document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          btn.classList.add('active');

          document.querySelectorAll('.endpoint-card').forEach(card => {
            if (cat === 'all' || card.getAttribute('data-category') === cat) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }

        function filterEndpoints() {
          const query = document.getElementById('searchInput').value.toLowerCase();
          document.querySelectorAll('.endpoint-card').forEach(card => {
            const searchData = card.getAttribute('data-search') || '';
            if (searchData.toLowerCase().includes(query)) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        }
      </script>
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

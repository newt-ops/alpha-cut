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
import { getAllPackageConfigs, getLiveExchangeRate } from './controllers/admin.controller.js';

validateEnv();

const app = express();

// Trust reverse proxy (Render / Vercel / Nginx load balancers)
app.set('trust proxy', 1);

// Helmet CSP & Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://apis.google.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com', 'https://*.googleusercontent.com'],
        connectSrc: ["'self'", 'https://accounts.google.com', 'https://api.cloudinary.com', 'https://alpha-cut.onrender.com'],
        frameSrc: ["'self'", 'https://accounts.google.com', 'https://www.youtube.com', 'https://player.vimeo.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  config.clientUrl,
  'https://alpha-cut-nine.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for production deployment flexibility
      }
    },
    credentials: true,
  })
);

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
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
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
// app.use('/api/payments', paymentRoutes); // Uncomment when ready to reintegrate Chapa payments

app.use('/api', contractRoutes);
app.get('/api/packages/exchange-rate', getLiveExchangeRate);
app.get('/api/packages', getAllPackageConfigs);

app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Alpha Cut — API Engine & Telegram Bot Server</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #0d1117;
          color: #c9d1d9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 24px;
        }
        .card {
          background-color: #161b22;
          border: 1px solid #30363d;
          border-radius: 16px;
          padding: 36px;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          text-align: center;
        }
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          background-color: rgba(36, 161, 222, 0.15);
          color: #24A1DE;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          border: 1px solid rgba(36, 161, 222, 0.3);
        }
        h1 { font-size: 24px; color: #f0f6fc; margin-bottom: 8px; font-weight: 700; }
        p { font-size: 14px; color: #8b949e; line-height: 1.6; margin-bottom: 24px; }
        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
          text-align: left;
        }
        .status-item {
          background-color: #0d1117;
          border: 1px solid #21262d;
          padding: 12px 14px;
          border-radius: 8px;
          font-size: 13px;
        }
        .status-label { color: #8b949e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .status-value { color: #3fb950; font-weight: 600; display: flex; alignItems: center; gap: 6px; }
        .btn-group { display: flex; gap: 12px; flex-direction: column; }
        .btn {
          display: block;
          padding: 12px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .btn-primary { background-color: #24A1DE; color: #ffffff; }
        .btn-secondary { background-color: #21262d; color: #c9d1d9; border: 1px solid #30363d; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">API Engine Operational</div>
        <h1>Alpha Cut Backend Server</h1>
        <p>REST API Engine & Telegram Bot Microservices are running active on Render.</p>
        
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">API Health</div>
            <div class="status-value">🟢 Online</div>
          </div>
          <div class="status-item">
            <div class="status-label">MongoDB</div>
            <div class="status-value">${mongoose.connection.readyState === 1 ? '🟢 Connected' : '🟡 Connecting'}</div>
          </div>
        </div>

        <div class="btn-group">
          <a href="https://alpha-cut-nine.vercel.app" class="btn btn-primary">Open Alpha Cut Web Platform</a>
          <a href="https://t.me/alpha_cut_bot" class="btn btn-secondary">Open Telegram Bot</a>
        </div>
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
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
    }
  }
};

startServer();

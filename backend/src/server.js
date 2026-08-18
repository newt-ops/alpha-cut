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

app.use('/api', contractRoutes);
app.get('/api/packages/exchange-rate', getLiveExchangeRate);
app.get('/api/packages', getAllPackageConfigs);

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

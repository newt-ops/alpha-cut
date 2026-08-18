import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getFeatureFlags,
  getChapaStatus,
  toggleChapaTestMode,
  initializeChapaPayment,
  verifyChapaPayment,
  handleChapaWebhook,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Public Feature Flags & Status
router.get('/public/feature-flags', getFeatureFlags);
router.get('/status', getChapaStatus);

// Admin Controls
router.post('/toggle-test-mode', requireAuth, requireAdmin, toggleChapaTestMode);

// Client Payment Lifecycle (Rate limited, ownership checked)
router.post('/initialize', requireAuth, initializeChapaPayment);
router.post('/chapa/initialize', requireAuth, initializeChapaPayment);

// Payment Status Verification & Webhook
router.get('/verify/:txRef', verifyChapaPayment);
router.get('/chapa/verify/:txRef', verifyChapaPayment);

// Webhook (Signature Verified)
router.post('/webhook', handleChapaWebhook);
router.post('/chapa/webhook', handleChapaWebhook);

export default router;

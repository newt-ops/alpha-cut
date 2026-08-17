import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getChapaStatus,
  toggleChapaTestMode,
  initializeChapaPayment,
  verifyChapaPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/status', getChapaStatus);
router.post('/toggle-test-mode', requireAuth, requireAdmin, toggleChapaTestMode);
router.post('/initialize', requireAuth, initializeChapaPayment);
router.get('/verify/:txRef', requireAuth, verifyChapaPayment);
router.post('/webhook', verifyChapaPayment);

export default router;

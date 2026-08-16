import express from 'express';
import {
  signup,
  login,
  googleAuth,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { requireAuth, authRateLimiter } from '../middleware/auth.middleware.js';
import {
  validateRequest,
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authRateLimiter);

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleAuth);
router.post('/verify-email', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;

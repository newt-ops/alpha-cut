import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getPublicRatings,
  submitRating,
  toggleHideRating,
} from '../controllers/rating.controller.js';

const router = express.Router();

router.get('/', getPublicRatings);
router.post('/', requireAuth, submitRating);
router.post('/:id/hide', requireAuth, requireAdmin, toggleHideRating);

export default router;

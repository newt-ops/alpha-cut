import express from 'express';
import { getPublicRatings, submitRating, toggleHideRating, toggleFeatureRating } from '../controllers/rating.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validateRequest, submitRatingSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getPublicRatings);
router.post('/', requireAuth, validateRequest(submitRatingSchema), submitRating);
router.post('/:id/hide', requireAuth, requireAdmin, toggleHideRating);
router.post('/:id/feature', requireAuth, requireAdmin, toggleFeatureRating);

export default router;

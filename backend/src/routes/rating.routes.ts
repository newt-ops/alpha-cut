import express, { Request, Response, NextFunction } from 'express';
import { getPublicRatings, submitRating, toggleHideRating, toggleFeatureRating, deleteRating } from '../controllers/rating.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validateRequest, submitRatingSchema } from '../middleware/validation.middleware.js';

const router = express.Router();

// Optional auth middleware wrapper
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  next();
};

router.get('/', getPublicRatings);
router.post('/', optionalAuth, validateRequest(submitRatingSchema), submitRating);
router.post('/:id/hide', requireAuth, requireAdmin, toggleHideRating);
router.post('/:id/feature', requireAuth, requireAdmin, toggleFeatureRating);
router.put('/:id/feature', requireAuth, requireAdmin, toggleFeatureRating);
router.delete('/:id', requireAuth, requireAdmin, deleteRating);

export default router;

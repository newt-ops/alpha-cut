import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../controllers/portfolio.controller.js';

const router = express.Router();

// Public route to view portfolio items
router.get('/', getPortfolioItems);

// Admin protected routes to manage portfolio items
router.post('/', requireAuth, requireAdmin, createPortfolioItem);
router.put('/:id', requireAuth, requireAdmin, updatePortfolioItem);
router.delete('/:id', requireAuth, requireAdmin, deletePortfolioItem);

export default router;

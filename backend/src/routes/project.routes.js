import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getClientProjects,
  acceptProposal,
  declineProposal,
  approveDelivery,
} from '../controllers/project.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getClientProjects);
router.post('/:id/accept', acceptProposal);
router.post('/:id/decline', declineProposal);
router.post('/:id/approve', approveDelivery);

export default router;

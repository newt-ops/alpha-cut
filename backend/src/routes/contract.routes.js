import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  createContractProposal,
  getAllContractsAdmin,
  addDeliverable,
  completeContract,
  getClientContracts,
  acceptContract,
  declineContract,
  approveDeliverable,
  submitContractRating,
  deleteDeliverable,
  cancelContract,
} from '../controllers/contract.controller.js';

const router = express.Router();

// Admin Contract Routes
router.post('/admin/contracts', requireAuth, requireAdmin, createContractProposal);
router.get('/admin/contracts', requireAuth, requireAdmin, getAllContractsAdmin);
router.post('/admin/contracts/:id/deliverables', requireAuth, requireAdmin, addDeliverable);
router.delete('/admin/contracts/:id/deliverables/:deliverableId', requireAuth, requireAdmin, deleteDeliverable);
router.post('/admin/contracts/:id/complete', requireAuth, requireAdmin, completeContract);
router.post('/admin/contracts/:id/cancel', requireAuth, requireAdmin, cancelContract);

// Client Contract Routes
router.get('/contracts', requireAuth, getClientContracts);
router.post('/contracts/:id/accept', requireAuth, acceptContract);
router.post('/contracts/:id/decline', requireAuth, declineContract);
router.post('/contracts/:id/deliverables/:deliverableId/approve', requireAuth, approveDeliverable);
router.post('/contracts/:id/rating', requireAuth, submitContractRating);

export default router;

import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  searchUsers,
  getAllClients,
  createProposal,
  getAllProjects,
  markDelivered,
  getStats,
  updatePackageConfig,
  getAllPackageConfigs,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/users/search', searchUsers);
router.get('/clients', getAllClients);
router.post('/projects', createProposal);
router.get('/projects', getAllProjects);
router.post('/projects/:id/deliver', markDelivered);
router.get('/stats', getStats);
router.put('/packages', updatePackageConfig);
router.get('/packages', getAllPackageConfigs);

export default router;

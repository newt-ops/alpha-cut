import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getNotifications, markRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.post('/:id/read', markRead);

export default router;

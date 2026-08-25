import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import * as invoiceController from '../controllers/invoice.controller.js';

const router = Router();

// Protect all routes — Admin role required
router.use(requireAuth);
router.use(requireAdmin);

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/client/:clientId/balance', invoiceController.getClientBalanceSheet);
router.get('/:id/pdf', invoiceController.exportInvoicePdf);

export default router;

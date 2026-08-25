import * as invoiceService from '../services/invoice.service.js';
import { Invoice } from '../models/Invoice.js';
export const createInvoice = async (req, res, next) => {
    try {
        const invoice = await invoiceService.createInvoice(req.body);
        res.status(201).json({ success: true, invoice });
    }
    catch (err) {
        next(err);
    }
};
export const getAllInvoices = async (req, res, next) => {
    try {
        const { status, clientId } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (clientId)
            query.clientId = clientId;
        const invoices = await Invoice.find(query).sort({ issuedAt: -1 });
        res.status(200).json({ success: true, invoices });
    }
    catch (err) {
        next(err);
    }
};
export const getClientBalanceSheet = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const statement = await invoiceService.getClientBalanceSheet(clientId);
        res.status(200).json({ success: true, statement });
    }
    catch (err) {
        next(err);
    }
};
export const exportInvoicePdf = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await invoiceService.exportInvoicePdf(id);
        res.status(200).json({ success: true, pdfData: result });
    }
    catch (err) {
        next(err);
    }
};

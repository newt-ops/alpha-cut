import { Request, Response, NextFunction } from 'express';
import * as invoiceService from '../services/invoice.service.js';
import { Invoice } from '../models/Invoice.js';

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status, clientId } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    const invoices = await Invoice.find(query).sort({ issuedAt: -1 });
    res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};

export const getClientBalanceSheet = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { clientId } = req.params;
    const statement = await invoiceService.getClientBalanceSheet(clientId as string);
    res.status(200).json({ success: true, statement });
  } catch (err) {
    next(err);
  }
};

export const exportInvoicePdf = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const result = await invoiceService.exportInvoicePdf(id as string);
    res.status(200).json({ success: true, pdfData: result });
  } catch (err) {
    next(err);
  }
};

import { Invoice, IInvoice } from '../models/Invoice.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Contract } from '../models/Contract.js';

export interface CreateInvoiceDto {
  clientId: string;
  projectId?: string;
  contractId?: string;
  title?: string;
  currency?: 'ETB' | 'USD';
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number }>;
  discount?: number;
  tax?: number;
  dueDate?: string;
  notes?: string;
}

/**
 * Generate a sequential invoice number e.g. INV-2026-0001
 */
const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments();
  const seq = (count + 1).toString().padStart(4, '0');
  return `INV-${year}-${seq}`;
};

/**
 * Create an Automated Invoice from Project or Contract or Custom Items
 */
export const createInvoice = async (dto: CreateInvoiceDto): Promise<IInvoice> => {
  const client = await User.findById(dto.clientId);
  if (!client) throw new Error('Client not found');

  let defaultTitle = dto.title || 'Professional Video Editing Services';
  let currency: 'ETB' | 'USD' = dto.currency || 'ETB';
  let lineItems = dto.lineItems || [];

  // Auto-fill from Project if provided
  if (dto.projectId && lineItems.length === 0) {
    const proj = await Project.findById(dto.projectId);
    if (proj) {
      defaultTitle = `Invoice for ${proj.editingStyle}`;
      currency = proj.currency as 'ETB' | 'USD';
      lineItems = [
        {
          description: `${proj.editingStyle} (${proj.contentLength === 'short' ? 'Short-Form' : 'Long-Form'})`,
          quantity: 1,
          unitPrice: proj.price || 0,
        },
      ];
    }
  }

  // Auto-fill from Contract if provided
  if (dto.contractId && lineItems.length === 0) {
    const contract = await Contract.findById(dto.contractId);
    if (contract) {
      defaultTitle = `Retainer Invoice (${contract.frequency})`;
      currency = contract.currency as 'ETB' | 'USD';
      lineItems = [
        {
          description: `Monthly Retainer Plan (${contract.packageTier} tier)`,
          quantity: 1,
          unitPrice: contract.monthlyPrice || 0,
        },
      ];
    }
  }

  // Calculate totals
  const processedItems = lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.quantity * item.unitPrice,
  }));

  const subtotal = processedItems.reduce((acc, i) => acc + i.amount, 0);
  const discount = dto.discount || 0;
  const tax = dto.tax || 0;
  const totalAmount = Math.max(0, subtotal - discount + tax);

  const invoiceNumber = await generateInvoiceNumber();
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const invoice = new Invoice({
    invoiceNumber,
    clientId: client._id,
    clientName: client.name,
    clientEmail: client.email,
    projectId: dto.projectId,
    contractId: dto.contractId,
    title: defaultTitle,
    currency,
    lineItems: processedItems,
    subtotal,
    discount,
    tax,
    totalAmount,
    amountPaid: 0,
    balanceDue: totalAmount,
    status: 'issued',
    dueDate,
    issuedAt: new Date(),
    notes: dto.notes || 'Payment due within 14 days of invoice issue date. Thank you for working with Alpha Cut!',
  });

  return await invoice.save();
};

/**
 * Calculate Client Balance Sheet & Statement
 */
export const getClientBalanceSheet = async (clientId: string) => {
  const invoices = await Invoice.find({ clientId }).sort({ issuedAt: -1 });

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
  const currentBalanceDue = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  return {
    clientId,
    invoiceCount: invoices.length,
    totalInvoiced,
    totalPaid,
    currentBalanceDue,
    invoices,
  };
};

/**
 * Stubbed PDF Exporter for Client Invoices & Statements
 */
export const exportInvoicePdf = async (invoiceId: string) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  // HTML Printable Template Stub for PDF conversion / Puppeteer / pdfkit
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #170B06; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #C9A06B; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #C9A06B; }
          .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .table th, .table td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
          .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ALPHA CUT STUDIO</div>
            <div>Invoice #: ${invoice.invoiceNumber}</div>
            <div>Date: ${new Date(invoice.issuedAt).toLocaleDateString()}</div>
          </div>
          <div>
            <h3>Billed To:</h3>
            <div>${invoice.clientName}</div>
            <div>${invoice.clientEmail}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.lineItems
              .map(
                (item) => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice} ${invoice.currency}</td>
                <td>${item.amount} ${invoice.currency}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total">
          Total Amount: ${invoice.totalAmount} ${invoice.currency}
        </div>
      </body>
    </html>
  `;

  return {
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    contentType: 'application/pdf',
    downloadFileName: `${invoice.invoiceNumber}.pdf`,
    htmlPreview: htmlTemplate,
    exportStatus: 'STUBBED_PDF_READY',
  };
};

import mongoose, { Schema } from 'mongoose';
const InvoiceLineItemSchema = new Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    amount: { type: Number, required: true, default: 0 },
});
const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },
    title: { type: String, required: true },
    currency: { type: String, enum: ['ETB', 'USD'], default: 'ETB' },
    lineItems: [InvoiceLineItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
        default: 'issued',
    },
    dueDate: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    notes: { type: String },
}, { timestamps: true });
export const Invoice = mongoose.model('Invoice', InvoiceSchema);

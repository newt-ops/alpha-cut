import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    sequenceNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    deliverableUrl: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['delivered', 'approved'],
      default: 'delivered',
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Deliverable = mongoose.model('Deliverable', deliverableSchema);

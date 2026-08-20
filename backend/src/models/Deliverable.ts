import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type DeliverableStatus = 'delivered' | 'approved';

export interface IDeliverable extends Document {
  contractId: Types.ObjectId;
  sequenceNumber: number;
  title: string;
  deliverableUrl: string;
  notes?: string;
  status: DeliverableStatus;
  deliveredAt: Date;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const deliverableSchema = new Schema<IDeliverable>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
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

export const Deliverable: Model<IDeliverable> = mongoose.models.Deliverable || mongoose.model<IDeliverable>('Deliverable', deliverableSchema);

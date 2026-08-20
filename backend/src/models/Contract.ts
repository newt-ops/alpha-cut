import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ContractStatus = 'proposed' | 'active' | 'declined' | 'completed' | 'cancelled';
export type ContractFrequency = 'weekly-1' | 'weekly-2' | 'weekly-3-4' | 'daily-1' | 'daily-2';

export interface IContract extends Document {
  clientId: Types.ObjectId;
  createdByAdminId: Types.ObjectId;
  status: ContractStatus;
  packageTier: 'basic' | 'professional' | 'premium';
  contentLength: 'short' | 'long';
  frequency: ContractFrequency;
  currency: 'USD' | 'ETB';
  monthlyPrice: number;
  startDate: Date;
  durationMonths: number;
  totalVideosPlanned: number;
  clientName: string;
  clientEmail: string;
  notes?: string;
  telegramStatusMessageId?: string | null;
  rated: boolean;
  proposedAt: Date;
  acceptedAt?: Date | null;
  declinedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['proposed', 'active', 'declined', 'completed', 'cancelled'],
      default: 'proposed',
    },
    packageTier: {
      type: String,
      enum: ['basic', 'professional', 'premium'],
      required: true,
    },
    contentLength: {
      type: String,
      enum: ['short', 'long'],
      default: 'short',
    },
    frequency: {
      type: String,
      enum: ['weekly-1', 'weekly-2', 'weekly-3-4', 'daily-1', 'daily-2'],
      default: 'weekly-2',
    },
    currency: {
      type: String,
      enum: ['USD', 'ETB'],
      default: 'ETB',
    },
    monthlyPrice: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    durationMonths: {
      type: Number,
      default: 1,
    },
    totalVideosPlanned: {
      type: Number,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    telegramStatusMessageId: {
      type: String,
      default: null,
    },
    rated: {
      type: Boolean,
      default: false,
    },
    proposedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Contract: Model<IContract> = mongoose.models.Contract || mongoose.model<IContract>('Contract', contractSchema);

import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ProjectStatus = 'proposal_sent' | 'in_progress' | 'declined' | 'delivered' | 'revision_requested' | 'completed';
export type ContentLength = 'short' | 'long';
export type PackageTier = 'basic' | 'professional' | 'premium' | 'custom';
export type Currency = 'USD' | 'ETB';
export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';
export type PaymentStructure = 'upfront_100' | 'deposit_50_50' | 'monthly_upfront';

export interface IProject extends Document {
  clientId: Types.ObjectId;
  createdByAdminId: Types.ObjectId;
  status: ProjectStatus;
  clientName: string;
  clientEmail: string;

  // Extended Proposal Agreement Metadata
  proposalTitle?: string;
  quantity: number;
  aspectRatio: AspectRatio;
  resolution?: string;
  targetPlatform?: string;
  includedServices: string[];
  excludedServices: string[];
  includedRevisions: number;
  paymentStructure: PaymentStructure;
  paymentTerms?: string;
  customPaymentTerms?: string;
  validUntil?: Date | null;
  clientResponsibilities?: string;

  // Standard Deliverable Fields
  editingStyle: string;
  contentLength: ContentLength;
  packageTier: PackageTier;
  currency: Currency;
  price: number;
  referenceBrief?: string;
  briefAttachmentUrl?: string | null;
  deadline: Date;
  notes?: string;
  deliverableUrl?: string | null;
  rated: boolean;
  revisionNotes?: string;
  revisionRequestedAt?: Date | null;
  revisionCount: number;
  adminNotes?: string;
  telegramStatusMessageId?: string | null;
  proposalSentAt: Date;
  acceptedAt?: Date | null;
  declinedAt?: Date | null;
  deliveredAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
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
      enum: ['proposal_sent', 'in_progress', 'declined', 'delivered', 'revision_requested', 'completed'],
      default: 'proposal_sent',
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },

    // Extended Proposal Agreement Schema
    proposalTitle: {
      type: String,
      default: 'Short-Form Video Editing Package',
    },
    quantity: {
      type: Number,
      default: 1,
    },
    aspectRatio: {
      type: String,
      enum: ['9:16', '16:9', '1:1', '4:5'],
      default: '9:16',
    },
    resolution: {
      type: String,
      default: '1080p Full HD',
    },
    targetPlatform: {
      type: String,
      default: 'Multi-Platform',
    },
    includedServices: {
      type: [String],
      default: ['Clean Cuts & Trimming', 'Animated Captions', 'Sound Design & SFX', 'Color Correction'],
    },
    excludedServices: {
      type: [String],
      default: ['Original Filming', 'Voiceover Recording', 'Thumbnail Design'],
    },
    includedRevisions: {
      type: Number,
      default: 2,
    },
    paymentStructure: {
      type: String,
      enum: ['upfront_100', 'deposit_50_50', 'monthly_upfront'],
      default: 'upfront_100',
    },
    paymentTerms: {
      type: String,
      default: '50% upfront, 50% on delivery',
    },
    customPaymentTerms: {
      type: String,
      default: '',
    },
    validUntil: {
      type: Date,
      default: null,
    },
    clientResponsibilities: {
      type: String,
      default: 'Client provides raw footage, assets, brand guidelines, and timely feedback.',
    },

    editingStyle: {
      type: String,
      required: true,
    },
    contentLength: {
      type: String,
      enum: ['short', 'long'],
      required: true,
    },
    packageTier: {
      type: String,
      enum: ['basic', 'professional', 'premium', 'custom'],
      required: true,
    },
    currency: {
      type: String,
      enum: ['USD', 'ETB'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    referenceBrief: {
      type: String,
      default: '',
    },
    briefAttachmentUrl: {
      type: String,
      default: null,
    },
    deadline: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    deliverableUrl: {
      type: String,
      default: null,
    },
    rated: {
      type: Boolean,
      default: false,
    },
    revisionNotes: {
      type: String,
      default: '',
    },
    revisionRequestedAt: {
      type: Date,
      default: null,
    },
    revisionCount: {
      type: Number,
      default: 0,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    telegramStatusMessageId: {
      type: String,
      default: null,
    },
    proposalSentAt: {
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
    deliveredAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', projectSchema);

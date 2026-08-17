import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['proposal_sent', 'in_progress', 'declined', 'delivered', 'completed'],
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
      enum: ['basic', 'professional', 'premium'],
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

export const Project = mongoose.model('Project', projectSchema);

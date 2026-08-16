import mongoose from 'mongoose';

const pendingLinkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      default: null,
      index: true,
    },
    token: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['code', 'deep_link'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const PendingLink = mongoose.model('PendingLink', pendingLinkSchema);

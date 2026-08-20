import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IPendingLink extends Document {
  userId: Types.ObjectId;
  code?: string | null;
  token?: string | null;
  type: 'code' | 'deep_link';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pendingLinkSchema = new Schema<IPendingLink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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

export const PendingLink: Model<IPendingLink> = mongoose.models.PendingLink || mongoose.model<IPendingLink>('PendingLink', pendingLinkSchema);

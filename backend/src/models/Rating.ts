import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IRating extends Document {
  subjectType: 'project' | 'contract';
  subjectId: Types.ObjectId;
  projectId?: Types.ObjectId | null;
  contractId?: Types.ObjectId | null;
  clientId: Types.ObjectId;
  clientName: string;
  clientTitle: string;
  clientAvatarUrl?: string | null;
  editingStyle: string;
  packageTier: string;
  stars: number;
  review: string;
  hidden: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    subjectType: {
      type: String,
      enum: ['project', 'contract'],
      default: 'project',
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    contractId: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientName: {
      type: String,
      default: 'Verified Client',
    },
    clientTitle: {
      type: String,
      default: 'Client',
    },
    clientAvatarUrl: {
      type: String,
      default: null,
    },
    editingStyle: {
      type: String,
      default: '',
    },
    packageTier: {
      type: String,
      default: '',
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Rating: Model<IRating> = mongoose.models.Rating || mongoose.model<IRating>('Rating', ratingSchema);

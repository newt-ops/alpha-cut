import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    subjectType: {
      type: String,
      enum: ['project', 'contract'],
      default: 'project',
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
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

export const Rating = mongoose.model('Rating', ratingSchema);

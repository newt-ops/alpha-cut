import mongoose from 'mongoose';

const packageConfigSchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: ['basic', 'professional', 'premium'],
      required: true,
    },
    length: {
      type: String,
      enum: ['short', 'long'],
      required: true,
    },
    currency: {
      type: String,
      enum: ['USD', 'ETB'],
      required: true,
    },
    priceMin: {
      type: Number,
      default: null,
    },
    priceMax: {
      type: Number,
      default: null,
    },
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

packageConfigSchema.index({ tier: 1, length: 1, currency: 1 }, { unique: true });

export const PackageConfig = mongoose.model('PackageConfig', packageConfigSchema);

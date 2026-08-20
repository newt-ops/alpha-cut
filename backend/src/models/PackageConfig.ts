import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPackageConfig extends Document {
  tier: 'basic' | 'professional' | 'premium';
  length: 'short' | 'long';
  currency: 'USD' | 'ETB';
  priceMin?: number | null;
  priceMax?: number | null;
  features: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const packageConfigSchema = new Schema<IPackageConfig>(
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
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

packageConfigSchema.index({ tier: 1, length: 1, currency: 1 }, { unique: true });

export const PackageConfig: Model<IPackageConfig> = mongoose.models.PackageConfig || mongoose.model<IPackageConfig>('PackageConfig', packageConfigSchema);

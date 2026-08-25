import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPortfolioItem extends Document {
  title: string;
  styleName: string;
  format: 'short' | 'long';
  duration: string;
  clientType: string;
  videoUrl: string;
  thumbnailUrl: string;
  rawVideoUrl?: string;
  rawThumbnailUrl?: string;
  isHeroFeatured: boolean;
  heroSlot?: number | null;
  isBeforeAfterFeatured?: boolean;
  featuredHome: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    styleName: {
      type: String,
      required: true,
      default: 'Viral Animation Breakdown',
    },
    format: {
      type: String,
      enum: ['short', 'long'],
      default: 'short',
    },
    duration: {
      type: String,
      default: '0:60',
    },
    clientType: {
      type: String,
      default: 'Creator / Brand',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    rawVideoUrl: {
      type: String,
      default: '',
    },
    rawThumbnailUrl: {
      type: String,
      default: '',
    },
    isHeroFeatured: {
      type: Boolean,
      default: false,
    },
    heroSlot: {
      type: Number,
      default: null,
    },
    isBeforeAfterFeatured: {
      type: Boolean,
      default: false,
    },
    featuredHome: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const PortfolioItem: Model<IPortfolioItem> = mongoose.models.PortfolioItem || mongoose.model<IPortfolioItem>('PortfolioItem', portfolioItemSchema);

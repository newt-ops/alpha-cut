import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema(
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
    isHeroFeatured: {
      type: Boolean,
      default: false,
    },
    heroSlot: {
      type: Number,
      default: null,
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

export const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

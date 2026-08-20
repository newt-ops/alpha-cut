export interface PackageFeature {
  name: string;
  included?: boolean;
  note?: string;
}

export interface PackageTierItem {
  id: string;
  name: string;
  tagline: string;
  isPopular?: boolean;
  rateRangeETB: string;
  minRateETB: number;
  maxRateETB: number;
  minRateUSD: number;
  maxRateUSD: number;
  features: PackageFeature[];
}

export interface FrequencyPreset {
  label: string;
  videosPerMonth: number;
  type: string;
}

export const PACKAGES_DATA = {
  shortForm: {
    currency: 'ETB',
    tiers: [
      {
        id: 'basic',
        name: 'Basic Edit Tier',
        tagline: 'Clean, essential cutting & standard visual polish.',
        rateRangeETB: '500 – 800',
        minRateETB: 500,
        maxRateETB: 800,
        minRateUSD: 18,
        maxRateUSD: 28,
        features: [
          { name: 'Standard Animated Captions', included: true },
          { name: 'Limited Curated B-Roll', included: true },
          { name: 'Basic Sound Effects (SFX)', included: true },
          { name: 'Minimal Motion Graphics', included: true },
          { name: 'Standard Color Correction', included: true },
          { name: 'Kinetic Motion Graphics', included: false },
          { name: 'Cinematic Color Grading', included: false },
          { name: 'Included Revisions', note: '1 Revision' },
        ],
      },
      {
        id: 'professional',
        name: 'Professional Tier',
        tagline: 'Advanced captions, enhanced audio mix & sound design.',
        isPopular: true,
        rateRangeETB: '900 – 1,400',
        minRateETB: 900,
        maxRateETB: 1400,
        minRateUSD: 35,
        maxRateUSD: 50,
        features: [
          { name: 'Advanced Kinetic Captions', included: true },
          { name: 'Extended Premium B-Roll', included: true },
          { name: 'Enhanced Sound Design & Audio Mix', included: true },
          { name: 'Moderate Motion Graphics', included: true },
          { name: 'Advanced Color Correction', included: true },
          { name: 'Custom Animated Captions', included: false },
          { name: 'Heavy Custom 3D Graphics', included: false },
          { name: 'Included Revisions', note: '2 Revisions' },
        ],
      },
      {
        id: 'premium',
        name: 'Premium Edit Tier',
        tagline: 'Full retention-driven edit with custom animations & cinematic grading.',
        rateRangeETB: '1,600 – 2,400',
        minRateETB: 1600,
        maxRateETB: 2400,
        minRateUSD: 60,
        maxRateUSD: 90,
        features: [
          { name: 'Custom Animated Captions', included: true },
          { name: 'Extensive Curated B-Roll', included: true },
          { name: 'Full Layered Sound Design', included: true },
          { name: 'Heavy Custom Motion Graphics', included: true },
          { name: 'Cinematic Color Grading', included: true },
          { name: 'Viral Pattern Interrupts & Hooks', included: true },
          { name: 'Priority Render Delivery', included: true },
          { name: 'Included Revisions', note: '3 Revisions' },
        ],
      },
    ] as PackageTierItem[],
  },
  longForm: {
    notice: 'Long-form podcast & YouTube editing rates range from 4,000 to 18,000 ETB ($90 to $500 USD) depending on duration and scope.',
    contactAction: 'Request Custom Long-Form Proposal',
  },
  frequencyPresets: [
    { label: '1 Video / Week', videosPerMonth: 4, type: 'weekly' },
    { label: '2 Videos / Week', videosPerMonth: 8, type: 'weekly' },
    { label: '3-4 Videos / Week', videosPerMonth: 14, type: 'weekly' },
    { label: '1 Video / Day', videosPerMonth: 30, type: 'daily' },
    { label: '2 Videos / Day', videosPerMonth: 60, type: 'daily' },
  ] as FrequencyPreset[],
};

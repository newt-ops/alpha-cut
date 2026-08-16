export const PACKAGES_DATA = {
  shortForm: {
    currency: 'ETB',
    tiers: [
      {
        id: 'basic',
        name: 'Basic Edit Tier',
        tagline: 'Clean, high-quality cutting & essential visual polish.',
        rateRangeETB: '350 – 400',
        minRateETB: 350,
        maxRateETB: 400,
        rateUSD: null, // Custom proposal on request
        features: [
          { name: 'A-Roll Cutting & Pacing', included: true },
          { name: 'Standard Animated Captions', included: true },
          { name: 'Basic B-Roll Overlay', included: true },
          { name: 'Basic Sound Effects (SFX)', included: true },
          { name: 'Custom Motion Graphics', included: false },
          { name: 'Advanced Color Grading', included: false },
          { name: 'Retention Pattern Interrupts', included: false },
          { name: 'Revisions per Video', note: '2 Revisions' },
        ],
      },
      {
        id: 'premium',
        name: 'Premium Edit Tier',
        tagline: 'Full retention-driven edit with kinetic motion graphics & sound design.',
        isPopular: true,
        rateRangeETB: '450 – 500',
        minRateETB: 450,
        maxRateETB: 500,
        rateUSD: null, // Custom proposal on request
        features: [
          { name: 'A-Roll Cutting & Pacing', included: true },
          { name: 'Kinetic Highlight Captions', included: true },
          { name: 'Curated Premium B-Roll', included: true },
          { name: 'Layered Sound Design & Audio Mix', included: true },
          { name: 'Custom 2D/3D Motion Graphics', included: true },
          { name: 'Cinematic Color Grading', included: true },
          { name: 'Viral Pattern Interrupts & Hooks', included: true },
          { name: 'Revisions per Video', note: 'Unlimited Revisions' },
        ],
      },
    ],
  },
  longForm: {
    notice: 'Long-form podcast & YouTube editing rates are custom tailored per project scope.',
    contactAction: 'Request Custom Long-Form Proposal',
  },
  frequencyPresets: [
    { label: '1 Video / Week', videosPerMonth: 4, type: 'weekly' },
    { label: '2 Videos / Week', videosPerMonth: 8, type: 'weekly' },
    { label: '3-4 Videos / Week', videosPerMonth: 14, type: 'weekly' },
    { label: '1 Video / Day', videosPerMonth: 30, type: 'daily' },
    { label: '2 Videos / Day', videosPerMonth: 60, type: 'daily' },
  ],
};

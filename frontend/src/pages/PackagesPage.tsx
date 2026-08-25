import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { CurrencyToggle } from '@components/ui/CurrencyToggle';
import { PACKAGES_DATA } from '../data/packagesData';
import { IconCheck, IconArrowRight, IconSparkles, IconFilm } from '@icons/icons';
import { customFetch } from '../utils/api';

export const PackagesPage: React.FC = () => {
  const [formatTab, setFormatTab] = useState<'short' | 'long'>('short');
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1); // 2 videos/week (8/mo)
  const [selectedTierId, setSelectedTierId] = useState('professional');
  const [tiers, setTiers] = useState<any[]>(PACKAGES_DATA.shortForm.tiers);
  const [exchangeRate, setExchangeRate] = useState({ usdToEtb: 128.5, etbToUsd: 0.00778 });

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [pkgRes, rateRes] = await Promise.all([
          customFetch('/api/packages').catch(() => ({ success: false })),
          customFetch('/api/packages/exchange-rate').catch(() => ({ success: false })),
        ]);

        let currentRate = 0.00778;
        if (rateRes.success && rateRes.etbToUsd) {
          setExchangeRate({ usdToEtb: rateRes.usdToEtb, etbToUsd: rateRes.etbToUsd });
          currentRate = rateRes.etbToUsd;
        }

        if (pkgRes.success && pkgRes.configs && pkgRes.configs.length > 0) {
          const updatedTiers = PACKAGES_DATA.shortForm.tiers.map((t) => {
            const dbEtbConfig = pkgRes.configs.find((c: any) => c.tier === t.id && c.currency === 'ETB' && c.length === formatTab);
            
            // Adjust defaults for long-form if formatTab === 'long'
            let minETB = dbEtbConfig?.priceMin || (formatTab === 'long' ? (t.id === 'basic' ? 4000 : t.id === 'professional' ? 7500 : 13000) : t.minRateETB);
            let maxETB = dbEtbConfig?.priceMax || (formatTab === 'long' ? (t.id === 'basic' ? 6500 : t.id === 'professional' ? 11000 : 18000) : t.maxRateETB);

            const minUSD = Math.round(minETB * currentRate);
            const maxUSD = Math.round(maxETB * currentRate);

            return {
              ...t,
              minRateETB: minETB,
              maxRateETB: maxETB,
              rateRangeETB: `${minETB.toLocaleString()} – ${maxETB.toLocaleString()}`,
              minRateUSD: minUSD,
              maxRateUSD: maxUSD,
              rateRangeUSD: `$${minUSD} – $${maxUSD}`,
            };
          });
          setTiers(updatedTiers);
        }
      } catch (err) {
        // Fallback to static defaults
      }
    };
    fetchLiveData();
  }, [formatTab]);

  const formatTabs = [
    { id: 'short', label: '9:16 Short-Form Rates (Reels/Shorts/TikTok)' },
    { id: 'long', label: '16:9 Long-Form Rates (Podcasts/YouTube)' },
  ];

  const presets = PACKAGES_DATA.frequencyPresets;
  const currentPreset = presets[selectedPresetIndex];
  const selectedTier = tiers.find((t) => t.id === selectedTierId) || tiers[1];

  const minMonthlyETB = currentPreset.videosPerMonth * selectedTier.minRateETB;
  const maxMonthlyETB = currentPreset.videosPerMonth * selectedTier.maxRateETB;

  const minMonthlyUSD = Math.round(minMonthlyETB * exchangeRate.etbToUsd);
  const maxMonthlyUSD = Math.round(maxMonthlyETB * exchangeRate.etbToUsd);

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="packages-page">
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 36px auto' }}>
        <Badge variant="gold">Transparent Production Pricing</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(34px, 5.5vw, 56px)', fontWeight: 800, marginTop: '12px', color: 'var(--ink)' }}>
          Packages & Rate Calculator
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Transparent editing tiers for Short-Form and Long-Form content. Calculate your exact monthly retainer investment.
        </p>
      </div>

      {/* Control Bar: Format Tabs & Currency Toggle */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          backgroundColor: 'var(--surface)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          marginBottom: '44px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Tabs tabs={formatTabs} activeTab={formatTab} onChange={(id) => setFormatTab(id as any)} />
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      </div>

      {/* 3-TIER PRICING CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '32px', marginBottom: '64px', alignItems: 'stretch' }}>
        {tiers.map((tier, idx) => {
          const isSelected = selectedTierId === tier.id;
          const isPopular = tier.isPopular;

          return (
            <motion.div
              key={tier.id}
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedTierId(tier.id)}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: '24px',
                border: isSelected ? '2px solid var(--accent-gold)' : isPopular ? '2px solid var(--accent-gold)' : '1px solid var(--line)',
                padding: '36px 30px 30px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                boxShadow: isSelected
                  ? '0 0 0 4px rgba(201, 160, 107, 0.25), 0 20px 40px -15px rgba(201, 160, 107, 0.35)'
                  : 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#170B06',
                    padding: '5px 18px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 16px rgba(201, 160, 107, 0.5)',
                    border: '2px solid var(--surface)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <IconSparkles size={13} color="#170B06" />
                  ★ MOST POPULAR TIER
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
                    0{idx + 1} / {tier.id.toUpperCase()}
                  </span>
                  <Badge variant={isSelected ? 'gold' : 'surface'} size="small">
                    {isSelected ? 'SELECTED' : tier.id === 'basic' ? 'ESSENTIAL' : tier.id === 'professional' ? 'HIGH GROWTH' : 'ENTERPRISE'}
                  </Badge>
                </div>

                <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>
                  {tier.name}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '24px', minHeight: '40px' }}>
                  {tier.tagline}
                </p>

                {/* Rate Display Box */}
                <div
                  style={{
                    backgroundColor: 'var(--bg)',
                    padding: '20px 22px',
                    borderRadius: '16px',
                    border: '1px solid var(--line)',
                    marginBottom: '28px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    PER VIDEO RATE ({formatTab === 'short' ? '9:16 SHORT' : '16:9 LONG'}):
                  </span>
                  {currency === 'ETB' ? (
                    <div>
                      <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1, display: 'block' }}>
                        {tier.rateRangeETB} ETB
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        (~${tier.minRateUSD} – ${tier.maxRateUSD} USD / edit)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1, display: 'block' }}>
                        ${tier.minRateUSD} – ${tier.maxRateUSD} USD
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                        ({tier.rateRangeETB} ETB / edit)
                      </span>
                    </div>
                  )}
                </div>

                {/* Features checklist */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '22px', marginBottom: '28px' }}>
                  <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                    INCLUDED TECHNIQUES & DELIVERABLES:
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tier.features.map((feat: any, i: number) => {
                      const isIncluded = feat.included !== false;
                      return (
                        <li key={i} style={{ fontSize: '13.5px', display: 'flex', alignItems: 'flex-start', gap: '10px', color: isIncluded ? 'var(--ink)' : 'var(--ink-soft)', opacity: isIncluded ? 1 : 0.45 }}>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: isIncluded ? 'rgba(201, 160, 107, 0.15)' : 'transparent',
                              border: `1px solid ${isIncluded ? 'var(--accent-gold)' : 'var(--line)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              marginTop: '1px',
                            }}
                          >
                            <IconCheck size={12} color={isIncluded ? 'var(--accent-gold)' : 'var(--ink-soft)'} />
                          </div>
                          <span>
                            <strong>{feat.name}</strong> {feat.note ? <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>({feat.note})</span> : ''}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div>
                <Button variant={isSelected ? 'primary' : 'secondary'} fullWidth size="large">
                  {isSelected ? '✓ Selected Tier' : `Select ${tier.name}`}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* INTERACTIVE MONTHLY BUDGET CALCULATOR */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <IconSparkles size={24} color="var(--accent-gold)" />
          <h2 className="font-display" style={{ fontSize: '28px', fontWeight: 800 }}>
            Monthly Retainer Investment Calculator
          </h2>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: '15px', marginBottom: '32px' }}>
          Select your publishing frequency preset to estimate your monthly budget for the <strong>{selectedTier.name}</strong> tier.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
          {/* Volume Presets */}
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '14px' }}>
              CHOOSE PUBLISHING FREQUENCY:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {presets.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPresetIndex(idx)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-gold)' : 'var(--line)'}`,
                      backgroundColor: isSelected ? 'rgba(201, 160, 107, 0.12)' : 'var(--bg)',
                      color: isSelected ? 'var(--accent-gold)' : 'var(--ink)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>{preset.label}</span>
                    <span className="font-mono" style={{ fontSize: '12px', opacity: 0.85 }}>
                      {preset.videosPerMonth} vids/mo
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monthly Cost Output Box */}
          <div
            style={{
              backgroundColor: 'var(--bg)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--accent-gold)',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 40px -15px rgba(201, 160, 107, 0.3)',
            }}
          >
            <Badge variant="gold" size="small">ESTIMATED MONTHLY INVESTMENT</Badge>
            <h3 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 36px)', marginTop: '16px', color: 'var(--accent-gold)', fontWeight: 800, lineHeight: 1.1 }}>
              {currency === 'ETB'
                ? `${minMonthlyETB.toLocaleString()} – ${maxMonthlyETB.toLocaleString()} ETB`
                : `$${minMonthlyUSD.toLocaleString()} – $${maxMonthlyUSD.toLocaleString()} USD`}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '10px', lineHeight: 1.4 }}>
              Based on {currentPreset.videosPerMonth} videos/month using the <strong style={{ color: 'var(--ink)' }}>{selectedTier.name}</strong> ({formatTab === 'short' ? '9:16 Short-Form' : '16:9 Long-Form'}).
            </p>

            <div style={{ marginTop: '28px' }}>
              <a href="https://t.me/Alphacut_co" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="primary" fullWidth size="large" iconRight={IconArrowRight}>
                  Request Official Proposal
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

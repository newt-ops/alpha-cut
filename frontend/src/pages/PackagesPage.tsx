import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { CurrencyToggle } from '@components/ui/CurrencyToggle';
import { PACKAGES_DATA } from '../data/packagesData';
import { IconCheck, IconArrowRight, IconInfo, IconSparkles } from '@icons/icons';
import { customFetch } from '../utils/api';

export const PackagesPage: React.FC = () => {
  const [formatTab, setFormatTab] = useState('short');
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
            const minETB = dbEtbConfig?.priceMin || t.minRateETB;
            const maxETB = dbEtbConfig?.priceMax || t.maxRateETB;

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
    { id: 'short', label: 'Short-Form Rates (Reels/Shorts/TikTok)' },
    { id: 'long', label: 'Long-Form Rates (Podcasts/YouTube)' },
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
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px auto' }}>
        <Badge variant="gold">Pricing System</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Packages & Monthly Calculator
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Transparent 3-tier editing rates with live exchange rates. Calculate your monthly investment based on publishing frequency.
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
          marginBottom: '40px',
        }}
      >
        <Tabs tabs={formatTabs} activeTab={formatTab} onChange={setFormatTab} />
        <CurrencyToggle currency={currency} onChange={setCurrency} />
      </div>

      {formatTab === 'short' ? (
        <>
          {/* 3-TIER PRICING CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '32px', marginBottom: '60px' }}>
            {tiers.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${isSelected ? 'var(--accent-gold)' : tier.isPopular ? 'var(--accent-gold)' : 'var(--line)'}`,
                    padding: '32px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 0 0 4px rgba(201, 160, 107, 0.2)' : 'var(--shadow-sm)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {tier.isPopular && (
                    <div style={{ position: 'absolute', top: '-14px', right: '24px' }}>
                      <Badge variant="gold" size="small">MOST POPULAR</Badge>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '4px' }}>{tier.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '24px' }}>
                      {tier.tagline}
                    </p>

                    {/* Rate Display */}
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginBottom: '24px' }}>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
                        PER VIDEO RATE:
                      </span>
                      {currency === 'ETB' ? (
                        <div>
                          <span className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                            {tier.rateRangeETB}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600, marginLeft: '6px' }}>ETB</span>
                          <span style={{ display: 'block', fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            (~${tier.minRateUSD} – ${tier.maxRateUSD} USD)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                            ${tier.minRateUSD} – ${tier.maxRateUSD}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600, marginLeft: '6px' }}>USD</span>
                          <span style={{ display: 'block', fontSize: '12px', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            ({tier.rateRangeETB} ETB)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features checklist */}
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tier.features.map((feat: any, i: number) => (
                        <li key={i} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', color: feat.included !== false ? 'var(--ink)' : 'var(--ink-soft)', opacity: feat.included !== false ? 1 : 0.4 }}>
                          <IconCheck size={18} color={feat.included !== false ? 'var(--accent-gold)' : 'var(--line)'} />
                          <span>{feat.name} {feat.note ? `— ${feat.note}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: '32px' }}>
                    <Button variant={isSelected ? 'primary' : 'secondary'} fullWidth>
                      {isSelected ? 'Selected Tier' : 'Select This Tier'}
                    </Button>
                  </div>
                </div>
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
              <h2 className="font-display" style={{ fontSize: '28px' }}>
                Monthly Investment Calculator
              </h2>
            </div>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px', marginBottom: '32px' }}>
              Select your publishing volume and tier to calculate estimated monthly investment.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
              {/* Volume Presets */}
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '12px' }}>
                  PUBLISHING FREQUENCY PRESET:
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
                          backgroundColor: isSelected ? 'rgba(201, 160, 107, 0.1)' : 'var(--bg)',
                          color: isSelected ? 'var(--accent-gold)' : 'var(--ink)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span>{preset.label}</span>
                        <span className="font-mono" style={{ fontSize: '12px', opacity: 0.8 }}>
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
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Badge variant="gold" size="small">ESTIMATED MONTHLY BUDGET</Badge>
                <h3 className="font-display" style={{ fontSize: '36px', marginTop: '16px', color: 'var(--ink)', fontWeight: 800 }}>
                  {currency === 'ETB'
                    ? `${minMonthlyETB.toLocaleString()} – ${maxMonthlyETB.toLocaleString()} ETB`
                    : `$${minMonthlyUSD.toLocaleString()} – $${maxMonthlyUSD.toLocaleString()} USD`}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '8px' }}>
                  Based on {currentPreset.videosPerMonth} videos/month using the <strong>{selectedTier.name}</strong> tier.
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
        </>
      ) : (
        /* LONG-FORM RATES PANEL */
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            padding: '48px 36px',
            textAlign: 'center',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <Badge variant="gold">Podcast & Long-Form</Badge>
          <h2 className="font-display" style={{ fontSize: '32px', marginTop: '16px' }}>
            Custom Long-Form Proposals
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
            {PACKAGES_DATA.longForm.notice}
          </p>

          <div style={{ marginTop: '36px' }}>
            <a href="https://t.me/Alphacut_co" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large" iconRight={IconArrowRight}>
                {PACKAGES_DATA.longForm.contactAction}
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

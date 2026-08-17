import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Tabs } from '@components/ui/Tabs';
import { CurrencyToggle } from '@components/ui/CurrencyToggle';
import { PACKAGES_DATA } from '../data/packagesData';
import { IconCheck, IconArrowRight, IconInfo, IconSparkles } from '@icons/icons';
import { customFetch } from '../utils/api';

export const PackagesPage = () => {
  const [formatTab, setFormatTab] = useState('short');
  const [currency, setCurrency] = useState('ETB');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1); // 2 videos/week (8/mo)
  const [selectedTierId, setSelectedTierId] = useState('professional');
  const [tiers, setTiers] = useState(PACKAGES_DATA.shortForm.tiers);
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
            const dbEtbConfig = pkgRes.configs.find((c) => c.tier === t.id && c.currency === 'ETB' && c.length === formatTab);
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

      {/* Long-Form State */}
      {formatTab === 'long' ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--line)',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <IconInfo size={40} color="var(--accent-gold)" style={{ marginBottom: '16px' }} />
          <h2 className="font-display" style={{ fontSize: '26px' }}>Custom Long-Form Proposal</h2>
          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
            {PACKAGES_DATA.longForm.notice}
          </p>
          <div style={{ marginTop: '28px' }}>
            <a href="mailto:alphacutagency@gmail.com">
              <Button variant="primary" iconRight={IconArrowRight}>
                {PACKAGES_DATA.longForm.contactAction}
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Live Currency Feed Notice */}
          <div
            style={{
              backgroundColor: 'rgba(201, 160, 107, 0.1)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              marginBottom: '32px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--ink)',
            }}
          >
            Live Market Conversion: 1 USD = {exchangeRate.usdToEtb} ETB. Displaying live rates in {currency}.
          </div>

          {/* 3 Pricing Tiers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', marginBottom: '60px' }}>
            {tiers.map((tier) => (
              <div
                key={tier.id}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${tier.isPopular ? 'var(--accent-gold)' : 'var(--line)'}`,
                  padding: '32px 26px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: tier.isPopular ? 'var(--shadow)' : 'none',
                }}
              >
                {tier.isPopular && (
                  <div style={{ position: 'absolute', top: '-14px', right: '24px' }}>
                    <Badge variant="gold">RECOMMENDED TIER</Badge>
                  </div>
                )}

                <div>
                  <h2 className="font-display" style={{ fontSize: '24px' }}>{tier.name}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', lineHeight: 1.5, minHeight: '40px' }}>
                    {tier.tagline}
                  </p>

                  <div style={{ margin: '24px 0' }}>
                    {currency === 'ETB' ? (
                      <div>
                        <span className="font-display" style={{ fontSize: '38px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {tier.rateRangeETB} <span style={{ fontSize: '18px' }}>ETB</span>
                        </span>
                        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                          PER SHORT-FORM VIDEO
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-display" style={{ fontSize: '38px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {tier.rateRangeUSD} <span style={{ fontSize: '18px' }}>USD</span>
                        </span>
                        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                          LIVE CONVERTED INTERNATIONAL RATE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feature Breakdown List */}
                  <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                    INCLUDED FEATURES:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tier.features.map((feat, idx) => (
                      <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: feat.included ? 'var(--ink)' : 'var(--ink-soft)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <IconCheck size={16} color={feat.included ? 'var(--accent-gold)' : 'var(--line)'} />
                          <span style={{ opacity: feat.included ? 1 : 0.45 }}>{feat.name}</span>
                        </div>
                        {feat.note && (
                          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                            {feat.note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <a href="mailto:alphacutagency@gmail.com">
                    <Button variant={tier.isPopular ? 'primary' : 'secondary'} fullWidth iconRight={IconArrowRight}>
                      Select {tier.name}
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* DELIVERY FREQUENCY CALCULATOR (3 Tiers) */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '40px 32px',
              maxWidth: '960px',
              margin: '0 auto',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Badge variant="gold" size="small">Interactive Calculator</Badge>
              <h2 className="font-display" style={{ fontSize: '28px', marginTop: '8px' }}>
                Delivery-Frequency Monthly Estimator
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                Select your expected video volume and package tier to see your monthly investment range.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
              {/* Controls */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                  1. Select Package Tier:
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <Button
                    variant={selectedTierId === 'basic' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setSelectedTierId('basic')}
                  >
                    Basic
                  </Button>
                  <Button
                    variant={selectedTierId === 'professional' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setSelectedTierId('professional')}
                  >
                    Professional
                  </Button>
                  <Button
                    variant={selectedTierId === 'premium' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setSelectedTierId('premium')}
                  >
                    Premium
                  </Button>
                </div>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                  2. Select Publishing Frequency:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPresetIndex(idx)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: selectedPresetIndex === idx ? 'var(--bg)' : 'transparent',
                        color: 'var(--ink)',
                        border: `1px solid ${selectedPresetIndex === idx ? 'var(--accent-gold)' : 'var(--line)'}`,
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{preset.label}</span>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                        {preset.videosPerMonth} videos/mo
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Result Card */}
              <div
                style={{
                  backgroundColor: '#170B06',
                  borderRadius: 'var(--radius-lg)',
                  padding: '36px 28px',
                  color: '#FBEFE1',
                  textAlign: 'center',
                  border: '2px solid var(--accent-gold)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
              >
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
                  ESTIMATED MONTHLY INVESTMENT
                </span>

                <div style={{ margin: '16px 0' }}>
                  {currency === 'ETB' ? (
                    <div>
                      <h3 className="font-display" style={{ fontSize: '34px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        {minMonthlyETB.toLocaleString()} – {maxMonthlyETB.toLocaleString()} ETB
                      </h3>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(251, 239, 225, 0.6)' }}>
                        for {currentPreset.videosPerMonth} videos per month ({selectedTier.name})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-display" style={{ fontSize: '34px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        ${minMonthlyUSD.toLocaleString()} – ${maxMonthlyUSD.toLocaleString()} USD
                      </h3>
                      <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(251, 239, 225, 0.6)' }}>
                        for {currentPreset.videosPerMonth} videos per month ({selectedTier.name})
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <a href="mailto:alphacutagency@gmail.com">
                    <Button variant="primary" fullWidth iconRight={IconArrowRight}>
                      Start Project
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

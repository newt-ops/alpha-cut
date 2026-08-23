import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { StarRating } from '@components/ui/StarRating';
import { PhoneFrame } from '@components/media/PhoneFrame';
import { BeforeAfterComparison } from '@components/home/BeforeAfterComparison';
import { EDITING_STYLES } from '../data/editingStyles';
import { PORTFOLIO_ITEMS } from '../data/portfolioItems';
import { PACKAGES_DATA } from '../data/packagesData';
import { IconArrowRight, IconSparkles, IconFilm, IconZap, IconShield, IconStar, IconCheck } from '@icons/icons';

export const HomePage: React.FC = () => {
  const featuredStyles = EDITING_STYLES.slice(0, 3);
  const [featuredReviews, setFeaturedReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState('5.0');
  const [totalReviews, setTotalReviews] = useState(12);
  const [packageTiers, setPackageTiers] = useState<any[]>(PACKAGES_DATA.shortForm.tiers);
  const [portfolioList, setPortfolioList] = useState<any[]>(PORTFOLIO_ITEMS);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
        const [pkgRes, rateRes, ratRes, portRes] = await Promise.all([
          fetch(`${API_BASE}/api/packages`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE}/api/packages/exchange-rate`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE}/api/ratings?featured=true`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE}/api/portfolio`).then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        let currentRate = 0.00778;
        if (rateRes.success && rateRes.etbToUsd) {
          currentRate = rateRes.etbToUsd;
        }

        if (pkgRes.success && pkgRes.configs && pkgRes.configs.length > 0) {
          const updatedTiers = PACKAGES_DATA.shortForm.tiers.map((t) => {
            const dbEtbConfig = pkgRes.configs.find((c: any) => c.tier === t.id && c.currency === 'ETB' && c.length === 'short');
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
          setPackageTiers(updatedTiers);
        }

        if (ratRes.success && ratRes.ratings && ratRes.ratings.length > 0) {
          setFeaturedReviews(ratRes.ratings);
          setAvgRating(ratRes.avgRating);
          setTotalReviews(ratRes.totalReviews);
        }

        if (portRes.success && portRes.items && portRes.items.length > 0) {
          setPortfolioList(portRes.items);
        }
      } catch (err) {
        // Fallback to static defaults
      }
    };
    fetchLiveData();
  }, []);

  const heroItem1 = portfolioList.find((p) => p.heroSlot === 1 || p.isHeroFeatured) || portfolioList[0];
  const heroItem2 = portfolioList.find((p) => p.heroSlot === 2) || portfolioList[1] || portfolioList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '90px' }} className="home-page-container">
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', paddingTop: '40px', position: 'relative' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Badge variant="gold">Alpha Cut — High Impact Video Editing</Badge>
          </motion.div>

          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 'clamp(38px, 6.5vw, 68px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--ink)',
              marginTop: '16px',
              marginBottom: '20px',
            }}
          >
            Turn Raw Footage into Retention-Driven <span style={{ color: 'var(--accent-gold)' }}>Masterpieces</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--ink-soft)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto 36px auto',
            }}
          >
            We craft high-retention short-form clips, kinetic breakdowns, and cinematic storytelling engineered for YouTube Shorts, Reels & TikTok.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <Link to="/packages">
              <Button variant="primary" size="large" iconRight={IconArrowRight}>
                View Packages & Rates
              </Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="secondary" size="large" iconLeft={IconFilm}>
                Explore Portfolio
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Dual Phone Feature Reel in Hero */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            maxWidth: '640px',
            margin: '60px auto 0 auto',
          }}
        >
          {heroItem1 && (
            <PhoneFrame
              title={heroItem1.title}
              styleName={heroItem1.styleName}
              duration={heroItem1.duration}
              videoUrl={heroItem1.videoUrl}
              thumbnailUrl={heroItem1.thumbnailUrl}
              formatLabel="HERO REEL #1"
            />
          )}
          {heroItem2 && (
            <PhoneFrame
              title={heroItem2.title}
              styleName={heroItem2.styleName}
              duration={heroItem2.duration}
              videoUrl={heroItem2.videoUrl}
              thumbnailUrl={heroItem2.thumbnailUrl}
              formatLabel="HERO REEL #2"
            />
          )}
        </div>
      </section>

      {/* 2. VISUAL PROOF COMPARISON SLIDER SECTION */}
      <section>
        <BeforeAfterComparison />
      </section>

      {/* 3. FEATURED EDITING STYLES PREVIEW */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold">Craft & Techniques</Badge>
          <h2 className="font-display" style={{ fontSize: '36px', marginTop: '8px' }}>
            Featured Editing Styles
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: '4px', fontSize: '15px' }}>
            Proven visual frameworks built to hold viewer attention past the 3-second hook.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          {featuredStyles.map((style) => (
            <div
              key={style.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Badge variant="gold" size="small">{style.category}</Badge>
                <h3 className="font-display" style={{ fontSize: '20px', marginTop: '12px', marginBottom: '8px' }}>
                  {style.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {style.description}
                </p>
              </div>
              <Link to="/editing-styles">
                <Button variant="ghost" fullWidth iconRight={IconArrowRight}>
                  Explore Style Details
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link to="/editing-styles">
            <Button variant="secondary" iconRight={IconArrowRight}>
              View All Editing Styles
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. PACKAGES & TRANSPARENT PRICING SNAPSHOT */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold">Transparent Rates</Badge>
          <h2 className="font-display" style={{ fontSize: '36px', marginTop: '8px' }}>
            Short-Form Edit Tiers
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: '4px', fontSize: '15px' }}>
            Simple, predictable pricing with no hidden post-production fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {packageTiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${tier.isPopular ? 'var(--accent-gold)' : 'var(--line)'}`,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {tier.isPopular && (
                <div style={{ position: 'absolute', top: '-14px', right: '20px' }}>
                  <Badge variant="gold" size="small">MOST POPULAR</Badge>
                </div>
              )}
              <div>
                <h3 className="font-display" style={{ fontSize: '22px' }}>{tier.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px', marginBottom: '20px' }}>
                  {tier.tagline}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <span className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {tier.rateRangeETB} ETB
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                    (${tier.minRateUSD} – ${tier.maxRateUSD} USD / video)
                  </span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tier.features.map((feat: any, i: number) => (
                    <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: feat.included !== false ? 'var(--ink)' : 'var(--ink-soft)', opacity: feat.included !== false ? 1 : 0.5 }}>
                      <IconCheck size={16} color={feat.included !== false ? 'var(--accent-gold)' : 'var(--line)'} />
                      <span>{feat.name} {feat.note ? `(${feat.note})` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '28px' }}>
                <Link to="/packages">
                  <Button variant={tier.isPopular ? 'primary' : 'secondary'} fullWidth>
                    Select Tier
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLIENT RATINGS & SOCIAL PROOF */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '60px 32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Badge variant="gold">Client Reviews</Badge>
          <h2 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
            Trusted by Creators & Agencies
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
            <StarRating rating={5} />
            <span style={{ fontWeight: 700, fontSize: '16px' }}>{avgRating} / 5.0</span>
            <span style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>({totalReviews} verified ratings)</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {featuredReviews.slice(0, 3).map((rev) => (
            <div key={rev._id} style={{ backgroundColor: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <StarRating rating={rev.rating} size={16} />
              <p style={{ fontSize: '14px', color: 'var(--ink)', marginTop: '12px', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{rev.comment}"
              </p>
              <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600, display: 'block', marginTop: '12px' }}>
                — {rev.clientName || 'Verified Client'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/ratings">
            <Button variant="ghost" iconRight={IconArrowRight}>
              Read All Verified Client Reviews
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

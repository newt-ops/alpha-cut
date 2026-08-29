import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { StarRating } from '@components/ui/StarRating';

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


  const beforeAfterItem = portfolioList.find((p) => p.isBeforeAfterFeatured) || portfolioList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '90px' }} className="home-page-container">
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', paddingTop: '40px', position: 'relative' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Badge variant="gold">Alpha Cut — High Impact Video Editing</Badge>
          </motion.div>

          <motion.h1
            className="font-display hero-title-responsive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
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

      </section>

      {/* 2. VISUAL PROOF COMPARISON SLIDER SECTION */}
      <section>
        <BeforeAfterComparison
          title={beforeAfterItem?.title ? `Raw vs. ${beforeAfterItem.title}` : undefined}
          rawVideoUrl={beforeAfterItem?.rawVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
          editedVideoUrl={beforeAfterItem?.videoUrl || 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'}
          rawThumbnailUrl={beforeAfterItem?.rawThumbnailUrl || ''}
          editedThumbnailUrl={beforeAfterItem?.thumbnailUrl || ''}
        />
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

        <div className="responsive-grid-3" style={{ gap: '24px' }}>
          {featuredStyles.map((style) => (
            <motion.div
              key={style.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Badge variant="gold" size="small">{style.category}</Badge>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {style.format}
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px' }}>
                  {style.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {style.description}
                </p>

                {/* Key Feature Badges */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {style.features?.slice(0, 3).map((feat: string, i: number) => (
                    <span key={i} className="font-mono" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '100px', backgroundColor: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--ink-soft)' }}>
                      • {feat}
                    </span>
                  ))}
                </div>
              </div>

              <Link to="/editing-styles">
                <Button variant="ghost" fullWidth iconRight={IconArrowRight}>
                  Explore Style Details
                </Button>
              </Link>
            </motion.div>
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

      {/* 3.5 WHY WORK WITH US / AGENCY ADVANTAGES */}
      <section
        style={{
          backgroundColor: 'var(--surface)',
          padding: '64px 40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <Badge variant="gold">The Alpha Cut Edge</Badge>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', fontWeight: 800, marginTop: '10px' }}>
            Why Top Creators & Brands Choose Us
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: '8px', fontSize: '15px', maxWidth: '600px', margin: '8px auto 0 auto', lineHeight: 1.6 }}>
            We combine high-retention editing psychology with a streamlined client portal so you can scale your channel effortlessly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
          {[
            {
              icon: IconZap,
              title: '48-Hour Fast Delivery',
              badge: 'LIGHTNING SPEED',
              description: 'Never miss your posting schedule. Get studio-grade cutdowns rendered and ready to publish in 48 hours.',
            },
            {
              icon: IconSparkles,
              title: '+84% Retention Engineering',
              badge: 'ALGORITHM-READY',
              description: 'We craft kinetic hooks in the first 3 seconds with sound design and pattern interrupts engineered to boost watch time.',
            },
            {
              icon: IconShield,
              title: 'Dedicated Client Portal',
              badge: 'ZERO FRICTION',
              description: 'Track live progress, upload raw camera files, manage revisions, and download final MP4 renders in one dashboard.',
            },
            {
              icon: IconFilm,
              title: 'Mastered SFX & Color Grading',
              badge: 'STUDIO QUALITY',
              description: 'Pro audio levelling, dynamic sound effects (whooshes, risers, pops), and cinematic color correction included.',
            },
          ].map((item, index) => {
            const IconComp = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '28px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(201, 160, 107, 0.15)',
                        border: '1px solid var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-gold)',
                      }}
                    >
                      <IconComp size={22} color="var(--accent-gold)" />
                    </div>
                    <Badge variant="gold" size="small">{item.badge}</Badge>
                  </div>

                  <h3 className="font-display" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. PACKAGES & TRANSPARENT PRICING SNAPSHOT */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold">Transparent Rates</Badge>
          <h2 className="font-display" style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, marginTop: '8px', color: 'var(--ink)' }}>
            Short-Form Production Tiers
          </h2>
          <p style={{ color: 'var(--ink-soft)', marginTop: '6px', fontSize: '15px', maxWidth: '560px', margin: '6px auto 0 auto', lineHeight: 1.6 }}>
            Transparent per-video rate tiers designed for solo creators, growing channels, and enterprise brands.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '32px', alignItems: 'stretch' }}>
          {packageTiers.map((tier, idx) => {
            const isPopular = tier.isPopular;
            return (
              <motion.div
                key={tier.id}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '24px',
                  border: isPopular ? '2px solid var(--accent-gold)' : '1px solid var(--line)',
                  padding: '36px 30px 30px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: isPopular ? '0 25px 50px -12px rgba(201, 160, 107, 0.35)' : 'var(--shadow-sm)',
                  transition: 'background-color var(--transition-smooth), border-color var(--transition-smooth)',
                }}
              >
                {/* Asymmetric Metallic Gold Crown Banner for Popular Tier */}
                {isPopular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--accent-gold)',
                      color: 'var(--signal-ink)',
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
                    <IconSparkles size={13} color="var(--signal-ink)" />
                    ★ MOST POPULAR TIER
                  </div>
                )}

                <div>
                  {/* Chamber Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
                      0{idx + 1} / {tier.id.toUpperCase()}
                    </span>
                    <Badge variant={isPopular ? 'gold' : 'surface'} size="small">
                      {tier.id === 'basic' ? 'ESSENTIAL' : tier.id === 'professional' ? 'HIGH GROWTH' : 'ENTERPRISE'}
                    </Badge>
                  </div>

                  <h3 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>
                    {tier.name}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '24px', minHeight: '40px' }}>
                    {tier.tagline}
                  </p>

                  {/* Futuristic Floating Rate Box */}
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
                      ESTIMATED RATE PER EDIT
                    </span>
                    <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1.1, display: 'block' }}>
                      {tier.rateRangeETB} ETB
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-soft)', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                      (${tier.minRateUSD} – ${tier.maxRateUSD} USD / video)
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '22px', marginBottom: '28px' }}>
                    <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.06em', display: 'block', marginBottom: '14px' }}>
                      WHAT'S INCLUDED IN THIS CHAMBER:
                    </span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {tier.features.map((feat: any, i: number) => {
                        const isIncluded = feat.included !== false;
                        return (
                          <li
                            key={i}
                            style={{
                              fontSize: '13.5px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '10px',
                              color: isIncluded ? 'var(--ink)' : 'var(--ink-soft)',
                              opacity: isIncluded ? 1 : 0.45,
                            }}
                          >
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
                  <Link to="/packages">
                    <Button variant={isPopular ? 'primary' : 'secondary'} fullWidth size="large">
                      Select {tier.name} Tier
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. CLIENT RATINGS & SOCIAL PROOF */}
      {/* 5. CLIENT RATINGS & SOCIAL PROOF */}
      <section
        style={{
          position: 'relative',
          backgroundColor: 'var(--surface)',
          padding: '60px 36px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <Badge variant="gold">Client Reviews & Testimonials</Badge>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginTop: '8px' }}>
            Trusted by Creators, Founders & Agencies
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
            <StarRating rating={5} size={18} />
            <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--accent-gold)' }}>{avgRating} / 5.0</span>
            <span style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>• {totalReviews} Verified Client Reviews</span>
          </div>
        </div>

        {/* Featured Testimonials Spotlight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          {(featuredReviews.length > 0
            ? featuredReviews.slice(0, 3)
            : [
                {
                  _id: 'sample-1',
                  clientName: 'Alex Rivers',
                  clientTitle: 'Founder @ AI Studio',
                  clientAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=75',
                  review: 'Alpha Cut completely transformed our YouTube Shorts strategy. Watch time retention jumped by +84% on our very first edited video clip!',
                  stars: 5,
                  editingStyle: 'Viral Animation Breakdown',
                },
                {
                  _id: 'sample-2',
                  clientName: 'Marcus Vance',
                  clientTitle: 'Tech Content Creator (850K Subs)',
                  clientAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=75',
                  review: 'The turn-around time and kinetic typography quality are unmatched. The retention hooks keep viewers watching past 30 seconds consistently.',
                  stars: 5,
                  editingStyle: 'Cinematic Short-Film',
                },
                {
                  _id: 'sample-3',
                  clientName: 'Elena Rostova',
                  clientTitle: 'Head of Growth @ SaaSify',
                  clientAvatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=75',
                  review: 'Managing deliverables through the client portal is seamless. They deliver studio-grade edits that convert viewers into paying subscribers.',
                  stars: 5,
                  editingStyle: 'SaaS & App Animation',
                },
              ]
          ).map((rev: any) => {
            const stars = rev.stars || rev.rating || 5;
            const reviewText = rev.review || rev.comment || '';
            const initial = (rev.clientName || 'C').charAt(0).toUpperCase();

            return (
              <motion.div
                key={rev._id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--bg)',
                  padding: '32px 26px 26px 26px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(201, 160, 107, 0.3)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                {/* Decorative Quotation Watermark Background */}
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    fontSize: '110px',
                    fontFamily: 'serif',
                    lineHeight: 1,
                    color: 'var(--accent-gold)',
                    opacity: 0.12,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                >
                  “
                </span>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Rating Stars & Style Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <StarRating rating={stars} size={16} />
                    {rev.editingStyle && (
                      <Badge variant="gold" size="small">
                        {rev.editingStyle}
                      </Badge>
                    )}
                  </div>

                  {/* Review Quote Body */}
                  <p
                    style={{
                      fontSize: '14.5px',
                      color: 'var(--ink)',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      marginBottom: '24px',
                    }}
                  >
                    "{reviewText}"
                  </p>
                </div>

                {/* Client Profile Footer with Avatar, Name, Title & Verified Badge */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--line)',
                  }}
                >
                  {rev.clientAvatarUrl ? (
                    <img
                      src={rev.clientAvatarUrl}
                      alt={rev.clientName || 'Client Avatar'}
                      width="46"
                      height="46"
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-gold)',
                        boxShadow: '0 4px 12px rgba(201, 160, 107, 0.3)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-gold)',
                        color: 'var(--signal-ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(201, 160, 107, 0.3)',
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>
                        {rev.clientName || 'Verified Client'}
                      </span>
                      <IconCheck size={14} color="var(--accent-gold)" />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                      {rev.clientTitle || 'Creator / Brand Client'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/ratings">
            <Button variant="ghost" iconRight={IconArrowRight}>
              Read All Verified Client Reviews & Ratings
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

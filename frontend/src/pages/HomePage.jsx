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

export const HomePage = () => {
  const featuredStyles = EDITING_STYLES.slice(0, 3);
  const featuredPortfolio = PORTFOLIO_ITEMS.slice(0, 3);

  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [avgRating, setAvgRating] = useState('5.0');
  const [totalReviews, setTotalReviews] = useState(12);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
        const res = await fetch(`${API_BASE}/api/ratings?featured=true`);
        const data = await res.json();
        if (data.success && data.ratings && data.ratings.length > 0) {
          setFeaturedReviews(data.ratings);
          setAvgRating(data.avgRating);
          setTotalReviews(data.totalReviews);
        }
      } catch (err) {
        // Fallback to static reviews if offline
      }
    };
    fetchFeatured();
  }, []);

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
              marginTop: '20px',
            }}
          >
            Editing is the leverage point,{' '}
            <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontWeight: 400 }}>
              not an afterthought.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 2.2vw, 20px)',
              color: 'var(--ink-soft)',
              marginTop: '24px',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '24px auto 0 auto',
            }}
          >
            We transform raw video footage into retention-driven, high-converting assets engineered to hold attention, build authority, and drive client conversion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginTop: '36px',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/packages">
              <Button variant="primary" size="large" iconRight={IconArrowRight}>
                View Packages & Rates
              </Button>
            </Link>
            <Link to="/editing-styles">
              <Button variant="secondary" size="large" iconLeft={IconSparkles}>
                Explore Editing Styles
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero 3D Card Stack Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '60px',
            flexWrap: 'wrap',
          }}
        >
          <PhoneFrame title="Viral Educational Breakdown" styleName="Viral Animation" duration="0:58" />
          <div className="desktop-only" style={{ marginTop: '30px' }}>
            <PhoneFrame title="Cinematic Founder Story" styleName="Cinematic Short-Film" duration="1:15" />
          </div>
        </motion.div>
      </section>

      {/* 2. "WHY EDITING MATTERS" — INTERACTIVE SCROLL SECTION */}
      <section
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '60px 24px',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <Badge variant="gold">Core Philosophy</Badge>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginTop: '12px' }}>
            Why Editing Defines Content Success
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
            Great ideas die in boring edits. Here is how strategic video editing changes watch-time, conversion, and viewer perception.
          </p>
        </div>

        {/* 5 Scroll Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            maxWidth: '1100px',
            margin: '0 auto 60px auto',
          }}
        >
          {[
            {
              title: '1. The Hook (0–3s)',
              desc: 'The first 3 seconds decide whether a viewer stays or scrolls past. We construct high-impact visual & audio hooks.',
              icon: IconZap,
            },
            {
              title: '2. Watch-Time Retention',
              desc: 'Dynamic pacing, kinetic text, and rhythmic sound effects maintain viewer focus to the final frame.',
              icon: IconFilm,
            },
            {
              title: '3. Brand Perception',
              desc: 'Broadcast-grade color grading and clean typography signal instant premium credibility.',
              icon: IconShield,
            },
            {
              title: '4. Conversion Structure',
              desc: 'Clear visual callouts and structured pacing transform passive viewers into active leads and buyers.',
              icon: IconSparkles,
            },
            {
              title: '5. Reshare Value',
              desc: 'Memorable animation callouts and crisp insights make content naturally worth sharing.',
              icon: IconStar,
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(201, 160, 107, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} color="var(--accent-gold)" />
                </div>
                <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                  {pillar.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Before/After Component */}
        <BeforeAfterComparison />
      </section>

      {/* 3. EDITING STYLES TEASER */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="gold">Signature Styles</Badge>
            <h2 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
              Categorized Editing Styles
            </h2>
          </div>
          <Link to="/editing-styles">
            <Button variant="secondary" iconRight={IconArrowRight}>
              View All Styles
            </Button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {featuredStyles.map((style) => (
            <div
              key={style.id}
              style={{
                padding: '28px',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Badge variant="maroon" size="small">{style.category}</Badge>
                <h3 className="font-display" style={{ fontSize: '20px', marginTop: '12px', marginBottom: '8px' }}>
                  {style.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {style.description}
                </p>
              </div>
              <PhoneFrame title={style.name} styleName={style.category} formatLabel={style.format} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. PORTFOLIO TEASER */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '60px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="gold">Work Samples</Badge>
            <h2 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
              Selected Portfolio Showcase
            </h2>
          </div>
          <Link to="/portfolio">
            <Button variant="secondary" iconRight={IconArrowRight}>
              Explore Full Portfolio
            </Button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {featuredPortfolio.map((item) => (
            <PhoneFrame
              key={item.id}
              title={item.title}
              styleName={item.styleName}
              duration={item.duration}
              formatLabel={item.format === 'short' ? '9:16 SHORT' : '16:9 LONG'}
            />
          ))}
        </div>
      </section>

      {/* 5. PACKAGES TEASER */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px auto' }}>
          <Badge variant="gold">Transparent Pricing</Badge>
          <h2 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
            Basic vs. Premium Packages
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', marginTop: '8px' }}>
            Flat per-video rates with clear feature tiers. All rates in ETB (USD on request).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1140px', margin: '0 auto' }}>
          {PACKAGES_DATA.shortForm.tiers.map((tier) => (
            <div
              key={tier.id}
              style={{
                padding: '32px 28px',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: `2px solid ${tier.isPopular ? 'var(--accent-gold)' : 'var(--line)'}`,
                boxShadow: tier.isPopular ? 'var(--shadow)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {tier.isPopular && (
                <div style={{ position: 'absolute', top: '-14px', right: '24px' }}>
                  <Badge variant="gold">MOST POPULAR</Badge>
                </div>
              )}
              <div>
                <h3 className="font-display" style={{ fontSize: '22px' }}>{tier.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>{tier.tagline}</p>
                <div style={{ marginTop: '20px', marginBottom: '24px' }}>
                  <span className="font-display" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                    {tier.rateRangeETB} ETB
                  </span>
                  <span className="font-mono" style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block' }}>
                    per short-form video
                  </span>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tier.features.slice(0, 5).map((f, i) => (
                    <li key={i} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: f.included ? 'var(--ink)' : 'var(--ink-soft)' }}>
                      <IconCheck size={16} color={f.included ? 'var(--accent-gold)' : 'var(--line)'} />
                      <span style={{ opacity: f.included ? 1 : 0.5 }}>{f.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: '32px' }}>
                <Link to="/packages">
                  <Button variant={tier.isPopular ? 'primary' : 'secondary'} fullWidth>
                    Compare Packages
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RATINGS TEASER (DYNAMIC FEATURED REVIEWS) */}
      <section style={{ backgroundColor: 'var(--surface)', padding: '50px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
        <Badge variant="gold">Client Feedback</Badge>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <span className="font-display" style={{ fontSize: '42px', fontWeight: 800, color: 'var(--ink)' }}>{avgRating}</span>
          <div style={{ textAlign: 'left' }}>
            <StarRating rating={5} />
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
              Based on {totalReviews} verified client reviews
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '32px auto 24px auto', textAlign: 'left' }}>
          {featuredReviews.length > 0 ? (
            featuredReviews.slice(0, 3).map((r) => (
              <div key={r._id} style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <StarRating rating={r.stars} size={16} />
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', fontStyle: 'italic' }}>
                  "{r.review}"
                </p>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginTop: '8px' }}>
                  {r.clientName} ({r.editingStyle})
                </span>
              </div>
            ))
          ) : (
            <>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <StarRating rating={5} size={16} />
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', fontStyle: 'italic' }}>
                  "Alpha Cut doubled our retention rate in our first 3 videos. The kinetic captions and sound beats are unmatched."
                </p>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginTop: '8px' }}>
                  Tech Startup Founder
                </span>
              </div>
              <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <StarRating rating={5} size={16} />
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '8px', fontStyle: 'italic' }}>
                  "The turnaround speed and cinematic polish gave my brand instant authority on YouTube Shorts."
                </p>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginTop: '8px' }}>
                  Productivity Creator
                </span>
              </div>
            </>
          )}
        </div>

        <Link to="/ratings">
          <Button variant="ghost" iconRight={IconArrowRight}>
            Read All Reviews
          </Button>
        </Link>
      </section>

      {/* 7. FINAL CTA */}
      <section style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
        <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>
          Ready to Elevate Your Video Content?
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', maxWidth: '560px', margin: '12px auto 28px auto' }}>
          Partner with Amir & Aymen to build retention-focused edits that convert.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/packages">
            <Button variant="primary" size="large" iconRight={IconArrowRight}>
              Get Started with Packages
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

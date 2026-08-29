import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { PhoneFrame } from '@components/media/PhoneFrame';
import { EDITING_STYLES } from '../data/editingStyles';
import { IconCheck, IconSparkles, IconFilm } from '@icons/icons';
import { customFetch } from '../utils/api';

export const EditingStylesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStyleId, setExpandedStyleId] = useState<string | null>(null);
  const [activeVideoIndexes, setActiveVideoIndexes] = useState<Record<string, number>>({});
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchLivePortfolio = async () => {
      try {
        const res = await customFetch('/api/portfolio');
        if (res.success && res.items) {
          setPortfolioItems(res.items);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchLivePortfolio();
  }, []);

  const categories = ['All', 'Educational', 'Personal Brand', 'Product / SaaS', 'Viral Hook Driven', 'Knowledge'];

  const filteredStyles = EDITING_STYLES.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectSampleReel = (styleId: string, reelIndex: number) => {
    setActiveVideoIndexes((prev) => ({ ...prev, [styleId]: reelIndex }));
  };

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="editing-styles-page">
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 40px auto' }}>
        <Badge variant="gold">Visual Frameworks & Styles</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(34px, 5.5vw, 56px)', fontWeight: 800, marginTop: '12px', color: 'var(--ink)' }}>
          Categorized Editing Styles
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Each editing style is engineered for a specific algorithmic outcome — from maximum 3-second hook retention to cinematic brand storytelling.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div style={{ display: 'grid', gap: '20px', maxWidth: '840px', margin: '0 auto 48px auto' }}>
        <Input
          placeholder="Search styles by keyword (e.g. 'viral', 'educational', 'saas', 'cinematic')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category Chips (Touch Scrollable on Mobile) */}
        <div className="responsive-filter-bar" style={{ justifyContent: 'center' }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--surface)',
                  color: isActive ? '#170B06' : 'var(--ink)',
                  border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--line)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 12px rgba(201, 160, 107, 0.3)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>
          Showing {filteredStyles.length} of {EDITING_STYLES.length} Signature Editing Styles
        </div>
      </div>

      {/* Styles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '32px' }}>
        {filteredStyles.map((style) => {
          const isExpanded = expandedStyleId === style.id;
          
          // Match all portfolio items for this style
          const matchingVideos = portfolioItems.filter(
            (p) => p.styleName?.toLowerCase().includes(style.name.toLowerCase()) || p.styleName?.toLowerCase().includes(style.category.toLowerCase())
          );
          const activeReelIndex = activeVideoIndexes[style.id] || 0;
          const currentVideo = matchingVideos[activeReelIndex] || matchingVideos[0] || portfolioItems[0];

          return (
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
                {/* Style Category & Format */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <Badge variant="gold" size="small">{style.category}</Badge>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    {style.format}
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>
                  {style.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {style.description}
                </p>

                {/* Best For Highlight Box */}
                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                    marginBottom: '20px',
                  }}
                >
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    RECOMMENDED TARGET USE:
                  </span>
                  <p style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.4 }}>
                    {style.bestFor}
                  </p>
                </div>
              </div>

              {/* Interactive Phone Player Frame */}
              <div style={{ margin: '12px 0' }}>
                <PhoneFrame
                  title={currentVideo?.title || style.name}
                  styleName={style.category}
                  formatLabel={style.format}
                  videoUrl={currentVideo?.videoUrl}
                  thumbnailUrl={currentVideo?.thumbnailUrl}
                />

                {/* Multi-Sample Reel Switcher Pills (If multiple videos available) */}
                {matchingVideos.length > 1 && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                    {matchingVideos.map((video, idx) => {
                      const isSelected = activeReelIndex === idx;
                      return (
                        <button
                          key={video._id || idx}
                          type="button"
                          onClick={() => handleSelectSampleReel(style.id, idx)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '100px',
                            fontSize: '10px',
                            fontWeight: 700,
                            backgroundColor: isSelected ? 'var(--accent-gold)' : 'var(--bg)',
                            color: isSelected ? '#170B06' : 'var(--ink-soft)',
                            border: '1px solid var(--line)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {isSelected ? `▶ Reel #${idx + 1}` : `Reel #${idx + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expandable Technical Breakdown Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', marginTop: '16px', overflow: 'hidden' }}
                  >
                    <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', display: 'block', marginBottom: '12px' }}>
                      INCLUDED TECHNICAL TECHNIQUES:
                    </span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {style.features.map((feat, i) => (
                        <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
                          <IconCheck size={16} color="var(--accent-gold)" />
                          <span><strong>{feat}</strong></span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setExpandedStyleId(isExpanded ? null : style.id)}
                >
                  {isExpanded ? 'Hide Technical Breakdown' : 'Expand Style Breakdown'}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { Tabs } from '@components/ui/Tabs';
import { PhoneFrame } from '@components/media/PhoneFrame';
import { VideoFrame } from '@components/media/VideoFrame';
import { PORTFOLIO_ITEMS } from '../data/portfolioItems';
import { EDITING_STYLES } from '../data/editingStyles';
import { customFetch } from '../utils/api';

export const PortfolioPage: React.FC = () => {
  const [items, setItems] = useState<any[]>(PORTFOLIO_ITEMS);
  const [activeFormat, setActiveFormat] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all');

  useEffect(() => {
    const fetchLivePortfolio = async () => {
      try {
        const res = await customFetch('/api/portfolio');
        if (res.success && res.items && res.items.length > 0) {
          setItems(res.items);
        }
      } catch (err) {
        // Fallback to initial items
      }
    };
    fetchLivePortfolio();
  }, []);

  const formatTabs = [
    { id: 'all', label: 'All Works' },
    { id: 'short', label: 'Short-Form (9:16)' },
    { id: 'long', label: 'Long-Form (16:9)' },
  ];

  const filteredItems = items.filter((item) => {
    const matchesFormat = activeFormat === 'all' || item.format === activeFormat;
    const matchesStyle = selectedStyle === 'all' || item.styleName?.toLowerCase().includes(selectedStyle.toLowerCase());
    return matchesFormat && matchesStyle;
  });

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="portfolio-page">
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <Badge variant="gold">Selected Works</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Portfolio & Work Showcase
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Filter through our client projects by format and editing style. Live sample media is managed directly via the agency admin panel.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '48px',
        }}
      >
        <Tabs tabs={formatTabs} activeTab={activeFormat} onChange={setActiveFormat} />

        {/* Style Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setSelectedStyle('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: selectedStyle === 'all' ? 'var(--accent-gold)' : 'var(--surface)',
              color: selectedStyle === 'all' ? '#170B06' : 'var(--ink)',
              border: `1px solid ${selectedStyle === 'all' ? 'var(--accent-gold)' : 'var(--line)'}`,
              cursor: 'pointer',
            }}
          >
            All Styles
          </button>
          {EDITING_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.name)}
              style={{
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: selectedStyle === style.name ? 'var(--accent-gold)' : 'var(--surface)',
                color: selectedStyle === style.name ? '#170B06' : 'var(--ink)',
                border: `1px solid ${selectedStyle === style.name ? 'var(--accent-gold)' : 'var(--line)'}`,
                cursor: 'pointer',
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {filteredItems.map((item) => {
          const itemId = item._id || item.id;
          if (item.format === 'long') {
            return (
              <div key={itemId} style={{ gridColumn: 'span 1' }}>
                <VideoFrame
                  title={item.title}
                  styleName={item.styleName}
                  duration={item.duration}
                  videoUrl={item.videoUrl}
                  thumbnailUrl={item.thumbnailUrl}
                />
              </div>
            );
          }
          return (
            <PhoneFrame
              key={itemId}
              title={item.title}
              styleName={item.styleName}
              duration={item.duration}
              formatLabel="9:16 SHORT"
              videoUrl={item.videoUrl}
              thumbnailUrl={item.thumbnailUrl}
            />
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-soft)' }}>
          <p>No projects match the selected filters.</p>
        </div>
      )}
    </div>
  );
};

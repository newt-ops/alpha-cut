import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { PhoneFrame } from '@components/media/PhoneFrame';
import { EDITING_STYLES } from '../data/editingStyles';
import { IconCheck, IconSparkles } from '@icons/icons';

export const EditingStylesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedStyleId, setExpandedStyleId] = useState(null);

  const categories = ['All', 'Educational', 'Personal Brand', 'Product / SaaS', 'Viral Hook Driven', 'Knowledge'];

  const filteredStyles = selectedCategory === 'All'
    ? EDITING_STYLES
    : EDITING_STYLES.filter((s) => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="editing-styles-page">
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <Badge variant="gold">Editing Styles Catalog</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Categorized Editing Styles
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Each style is engineered for a specific outcome — from maximum viral retention to premium brand storytelling.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--surface)',
                color: isActive ? '#170B06' : 'var(--ink)',
                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--line)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Styles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {filteredStyles.map((style) => {
          const isExpanded = expandedStyleId === style.id;
          return (
            <div
              key={style.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Badge variant="gold" size="small">{style.category}</Badge>
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                    {style.format}
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: '22px', marginBottom: '8px' }}>
                  {style.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {style.description}
                </p>

                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                    marginBottom: '20px',
                  }}
                >
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
                    BEST USED FOR:
                  </span>
                  <p style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                    {style.bestFor}
                  </p>
                </div>
              </div>

              {/* Media Preview Frame */}
              <div style={{ margin: '16px 0' }}>
                <PhoneFrame title={style.name} styleName={style.category} formatLabel={style.format} />
              </div>

              {/* Expandable Breakdown Features */}
              {isExpanded && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', marginTop: '16px' }}>
                  <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '10px' }}>
                    KEY INCLUDED TECHNIQUES:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {style.features.map((feat, i) => (
                      <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
                        <IconCheck size={16} color="var(--accent-gold)" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setExpandedStyleId(isExpanded ? null : style.id)}
                >
                  {isExpanded ? 'Hide Technical Breakdown' : 'Expand Style Breakdown'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

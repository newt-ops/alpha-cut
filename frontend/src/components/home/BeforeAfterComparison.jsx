import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconSparkles, IconSliders } from '@icons/icons';

export const BeforeAfterComparison = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const [activeTab, setActiveTab] = useState('interactive');

  const handleSliderChange = (e) => {
    setSliderPos(Number(e.target.value));
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        padding: '32px 24px',
        boxShadow: 'var(--shadow)',
      }}
      className="before-after-wrapper"
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Badge variant="gold" size="small">Visual Proof</Badge>
        <h3 className="font-display" style={{ fontSize: '24px', marginTop: '8px' }}>
          Raw Footage vs. Alpha Cut Edit
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '4px' }}>
          Drag the slider to reveal how retention-driven editing transforms unedited video.
        </p>
      </div>

      {/* Mode Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => setSliderPos(0)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: sliderPos === 0 ? 'var(--line)' : 'transparent',
            color: 'var(--ink)',
            border: '1px solid var(--line)',
          }}
        >
          View Raw Only
        </button>
        <button
          onClick={() => setSliderPos(50)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: sliderPos === 50 ? 'var(--accent-gold)' : 'transparent',
            color: sliderPos === 50 ? '#170B06' : 'var(--ink)',
            border: '1px solid var(--accent-gold)',
          }}
        >
          Split Comparison (50/50)
        </button>
        <button
          onClick={() => setSliderPos(100)}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: sliderPos === 100 ? 'var(--accent-gold)' : 'transparent',
            color: sliderPos === 100 ? '#170B06' : 'var(--ink)',
            border: '1px solid var(--accent-gold)',
          }}
        >
          View Alpha Cut Edit
        </button>
      </div>

      {/* Main Interactive Comparison Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '9 / 16',
          margin: '0 auto',
          borderRadius: '32px',
          border: '4px solid #170B06',
          overflow: 'hidden',
          backgroundColor: '#0F0704',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          userSelect: 'none',
        }}
      >
        {/* Layer 1: RAW FOOTAGE (Left Side) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#2A2421',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 20px',
            color: '#8C827A',
            filter: 'grayscale(40%) contrast(85%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: '#8C827A', background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px' }}>
              RAW CAMERA FEED
            </span>
            <span style={{ fontSize: '11px' }}>Un-edited</span>
          </div>

          <div style={{ textAlign: 'center', margin: 'auto 0' }}>
            <p style={{ fontSize: '14px', fontFamily: 'serif', color: '#B3AAA2' }}>
              "Here is how I built my startup business..."
            </p>
            <span style={{ fontSize: '11px', display: 'block', marginTop: '12px', opacity: 0.6 }}>
              (No kinetic captions, flat audio, no B-roll)
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#8C827A', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            Retention dropoff rate: ~45% at 3s
          </div>
        </div>

        {/* Layer 2: ALPHA CUT EDIT (Right Side, clipped by sliderPos) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
            backgroundColor: '#170B06',
            backgroundImage: 'radial-gradient(circle at center, #2E180C 0%, #170B06 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 20px',
            color: '#FBEFE1',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge variant="gold" size="small">ALPHA CUT EDIT</Badge>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconSparkles size={14} color="var(--accent-gold)" />
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>SFX & COLOR GRADED</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: 'auto 0' }}>
            {/* Animated Kinetic Typography */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                backgroundColor: 'rgba(201, 160, 107, 0.2)',
                border: '2px solid var(--accent-gold)',
                padding: '12px 16px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#FFFDF8', display: 'block' }}>
                HOW I BUILT A <span style={{ color: 'var(--accent-gold)' }}>$1M AGENCY</span>
              </span>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '4px', display: 'block' }}>
                [ANIMATED MOTION GRAPHIC + SFX]
              </span>
            </motion.div>
          </div>

          <div style={{ backgroundColor: 'rgba(36,18,9,0.9)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--accent-gold)' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
              Retention boost: +84% Watch Time
            </span>
          </div>
        </div>

        {/* Divider Bar & Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: '3px',
            backgroundColor: 'var(--accent-gold)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            boxShadow: '0 0 10px rgba(201, 160, 107, 0.8)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-gold)',
              color: '#170B06',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <IconSliders size={18} />
          </div>
        </div>

        {/* Range Input overlay for dragging */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSliderChange}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'ew-resize',
            width: '100%',
            height: '100%',
            zIndex: 30,
          }}
        />
      </div>
    </div>
  );
};

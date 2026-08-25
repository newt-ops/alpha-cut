import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconSparkles, IconSliders } from '@icons/icons';

export interface BeforeAfterComparisonProps {
  rawVideoUrl?: string;
  editedVideoUrl?: string;
  rawThumbnailUrl?: string;
  editedThumbnailUrl?: string;
  title?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  rawVideoUrl = '',
  editedVideoUrl = '',
  rawThumbnailUrl = '',
  editedThumbnailUrl = '',
  title = 'Raw Footage vs. Alpha Cut Retention Edit',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const rawVideoRef = useRef<HTMLVideoElement>(null);
  const editedVideoRef = useRef<HTMLVideoElement>(null);

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSliderPos(Number(e.target.value));
  };

  useEffect(() => {
    // Keep both video streams synchronized
    if (rawVideoRef.current && editedVideoRef.current) {
      rawVideoRef.current.play().catch(() => {});
      editedVideoRef.current.play().catch(() => {});
    }
  }, [rawVideoUrl, editedVideoUrl]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '780px',
        margin: '0 auto',
        padding: '40px 32px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow)',
        overflow: 'hidden',
        transition: 'background-color var(--transition-smooth), border-color var(--transition-smooth)',
      }}
      className="before-after-wrapper"
    >
      {/* Background Radial Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(201, 160, 107, 0.1), transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ marginBottom: '28px' }}>
          <Badge variant="gold" size="small">VISUAL PROOF</Badge>
          <h3 className="font-display" style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, marginTop: '8px', color: 'var(--ink)' }}>
            {title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginTop: '6px', maxWidth: '560px', margin: '6px auto 0 auto' }}>
            Drag the interactive slider to reveal how kinetic captions, color grading, and SFX transform raw unedited video.
          </p>
        </div>

        {/* Modern Segmented Pill Controls */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            backgroundColor: 'var(--bg)',
            padding: '5px',
            borderRadius: '100px',
            border: '1px solid var(--line)',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color var(--transition-smooth)',
          }}
        >
          <button
            type="button"
            onClick={() => setSliderPos(0)}
            style={{
              padding: '8px 18px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: sliderPos === 0 ? 'var(--accent-gold)' : 'transparent',
              color: sliderPos === 0 ? '#170B06' : 'var(--ink-soft)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Raw Only (0%)
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(50)}
            style={{
              padding: '8px 18px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: sliderPos === 50 ? 'var(--accent-gold)' : 'transparent',
              color: sliderPos === 50 ? '#170B06' : 'var(--ink-soft)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Split View (50/50)
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(100)}
            style={{
              padding: '8px 18px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: sliderPos === 100 ? 'var(--accent-gold)' : 'transparent',
              color: sliderPos === 100 ? '#170B06' : 'var(--ink-soft)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            Alpha Cut Edit (100%)
          </button>
        </div>
      </div>

      {/* Main Interactive Comparison Display */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '9 / 16',
          margin: '0 auto',
          borderRadius: '38px',
          border: '2px solid rgba(201, 160, 107, 0.35)',
          overflow: 'hidden',
          backgroundColor: '#0F0704',
          boxShadow: '0 30px 70px -10px rgba(201, 160, 107, 0.4), 0 25px 45px -15px rgba(0, 0, 0, 0.95)',
          userSelect: 'none',
        }}
      >
        {/* Layer 1: RAW FOOTAGE (Base Layer) */}
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
            filter: 'grayscale(35%) contrast(85%)',
          }}
        >
          {rawVideoUrl ? (
            <video
              ref={rawVideoRef}
              src={rawVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.8,
              }}
            />
          ) : rawThumbnailUrl ? (
            <img
              src={rawThumbnailUrl}
              alt="Raw Footage"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.75,
              }}
            />
          ) : null}

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: '#FBEFE1', background: 'rgba(0,0,0,0.65)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)' }}>
              RAW CAMERA FEED
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Un-edited</span>
          </div>

          {!rawVideoUrl && !rawThumbnailUrl && (
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: 'auto 0' }}>
              <p style={{ fontSize: '14px', fontFamily: 'serif', color: '#B3AAA2' }}>
                "Here is how I built my startup business..."
              </p>
              <span style={{ fontSize: '11px', display: 'block', marginTop: '12px', opacity: 0.6 }}>
                (No kinetic captions, flat audio, no B-roll)
              </span>
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 2, fontSize: '11px', color: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Retention dropoff rate: ~45% at 3s
          </div>
        </div>

        {/* Layer 2: ALPHA CUT EDIT (Top Layer, clipped from Left to Right by sliderPos) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            backgroundColor: '#170B06',
            backgroundImage: 'radial-gradient(circle at center, #2E180C 0%, #170B06 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 20px',
            color: '#FBEFE1',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          }}
        >
          {editedVideoUrl ? (
            <video
              ref={editedVideoRef}
              src={editedVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : editedThumbnailUrl ? (
            <img
              src={editedThumbnailUrl}
              alt="Alpha Cut Edit"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : null}

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Badge variant="gold" size="small">ALPHA CUT EDIT</Badge>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(15,7,4,0.65)', padding: '3px 8px', borderRadius: '4px' }}>
              <IconSparkles size={14} color="var(--accent-gold)" />
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)' }}>SFX & GRADED</span>
            </div>
          </div>

          {!editedVideoUrl && !editedThumbnailUrl && (
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', margin: 'auto 0' }}>
              {/* Animated Kinetic Typography */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  backgroundColor: 'rgba(23, 11, 6, 0.85)',
                  border: '2px solid var(--accent-gold)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
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
          )}

          <div style={{ position: 'relative', zIndex: 2, backgroundColor: 'rgba(23, 11, 6, 0.9)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--accent-gold)' }}>
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
            boxShadow: '0 0 12px rgba(201, 160, 107, 0.9)',
            zIndex: 10,
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
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
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

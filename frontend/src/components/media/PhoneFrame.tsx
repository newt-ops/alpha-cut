import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconPlay, IconFilmReel, IconClose, IconVolume, IconVolumeMute } from '@icons/icons';

const parseYouTubeId = (url: string | null): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export interface PhoneFrameProps {
  title?: string;
  styleName?: string;
  duration?: string;
  formatLabel?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  onPlay?: ((payload: any) => void) | null;
  className?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  title = 'Sample Edit Title',
  styleName = 'Editing Style',
  duration = '0:60',
  formatLabel = '9:16 FORMAT',
  videoUrl = '',
  thumbnailUrl = '',
  onPlay = null,
  className = '',
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoUrl) {
      setCurrentVideoSrc(videoUrl);
    }
  }, [videoUrl]);

  const youtubeId = parseYouTubeId(currentVideoSrc);
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1` : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const clampX = (y / (rect.height / 2)) * -10;
    const clampY = (x / (rect.width / 2)) * 10;

    setRotateX(clampX);
    setRotateY(clampY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (onPlay) {
      onPlay({ title, styleName, duration, videoUrl: currentVideoSrc, thumbnailUrl });
    }
  };

  const handleVideoError = () => {
    console.warn('Primary video URL failed to load in browser, switching to reliable fallback stream...');
    if (currentVideoSrc !== 'https://www.w3schools.com/html/mov_bbb.mp4') {
      setCurrentVideoSrc('https://www.w3schools.com/html/mov_bbb.mp4');
    } else {
      setCurrentVideoSrc('https://media.w3.org/2010/05/sintel/trailer_hd.mp4');
    }
  };

  useEffect(() => {
    if (isPlaying && videoRef.current && !youtubeEmbedUrl) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch((err) => console.warn('Video playback failed:', err));
        }
      });
    }
  }, [isPlaying, youtubeEmbedUrl]);

  return (
    <div
      style={{ perspective: 1000, width: '100%', maxWidth: '280px', margin: '0 auto' }}
      className={`phone-frame-wrapper ${className}`}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleStartPlay}
        animate={{ rotateX: isPlaying ? 0 : rotateX, rotateY: isPlaying ? 0 : rotateY, scale: isHovered && !isPlaying ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '9 / 16',
          backgroundColor: '#170B06',
          borderRadius: '40px',
          border: '2px solid rgba(201, 160, 107, 0.35)',
          boxShadow: isHovered
            ? '0 35px 80px -10px rgba(201, 160, 107, 0.5), 0 25px 45px -15px rgba(0, 0, 0, 0.9)'
            : '0 25px 55px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(201, 160, 107, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px',
          color: '#FBEFE1',
          userSelect: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Top Speaker & Camera Island Notch */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90px',
            height: '18px',
            backgroundColor: '#0A0503',
            borderRadius: '12px',
            border: '1px solid rgba(201, 160, 107, 0.25)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            pointerEvents: 'none',
          }}
        >
          {/* Speaker Grill */}
          <div
            style={{
              width: '32px',
              height: '4px',
              backgroundColor: 'rgba(251, 239, 225, 0.25)',
              borderRadius: '2px',
            }}
          />
          {/* Camera Lens Circle */}
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#1E0F07',
              border: '1px solid rgba(201, 160, 107, 0.4)',
              boxShadow: 'inset 0 0 2px rgba(0,0,0,0.8)',
            }}
          />
        </div>

        {/* Ambient Video Preview Loop (when not actively full-screen playing) */}
        {currentVideoSrc && !youtubeEmbedUrl && !isPlaying ? (
          <video
            src={currentVideoSrc}
            autoPlay
            loop
            muted
            playsInline
            onError={handleVideoError}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: thumbnailUrl ? 0.35 : 0.6,
              filter: 'brightness(0.85) contrast(1.1)',
              zIndex: 0,
            }}
          />
        ) : null}

        {/* Real HTML5 / YouTube Video Overlay when playing */}
        {isPlaying ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 12, backgroundColor: '#000' }}>
            {youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={currentVideoSrc}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                onError={handleVideoError}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Video Controls Bar inside Phone */}
            <div
              style={{
                position: 'absolute',
                top: '32px',
                left: '12px',
                right: '12px',
                zIndex: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              {!youtubeEmbedUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.85)',
                    color: '#FBEFE1',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '100px',
                    padding: '5px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  {isMuted ? <IconVolumeMute size={14} color="var(--accent-gold)" /> : <IconVolume size={14} color="var(--accent-gold)" />}
                  <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(false);
                }}
                style={{
                  background: 'rgba(0,0,0,0.85)',
                  color: '#FBEFE1',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '100px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginLeft: 'auto',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}
              >
                <IconClose size={14} color="var(--accent-gold)" />
                <span>Close</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Optional Cover Thumbnail Image */}
        {thumbnailUrl && !isPlaying ? (
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Dynamic Glass Reflection Highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '140%',
            height: '45%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
            transform: 'rotate(-25deg) translateY(-20px)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        {/* Header Tags inside Phone */}
        <div
          style={{
            marginTop: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 4,
          }}
        >
          <Badge variant="gold" size="small">
            {formatLabel}
          </Badge>
          <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(251, 239, 225, 0.95)', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {duration}
          </span>
        </div>

        {/* Center Canvas / Play Indicator */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            zIndex: 4,
            margin: 'auto 0',
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.15 : [1, 1.06, 1] }}
            transition={{ repeat: isHovered ? 0 : Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(23, 11, 6, 0.75)',
              border: '2px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(201, 160, 107, 0.35), inset 0 0 12px rgba(201, 160, 107, 0.2)',
            }}
          >
            <IconPlay size={26} color="var(--accent-gold)" style={{ marginLeft: '3px' }} />
          </motion.div>
          <span
            className="font-mono"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              backgroundColor: 'rgba(15, 7, 4, 0.75)',
              padding: '3px 10px',
              borderRadius: '100px',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(201, 160, 107, 0.3)',
            }}
          >
            {videoUrl ? 'Click to Play' : 'Preview Reel'}
          </span>
        </div>

        {/* Footer Info inside Phone */}
        <div
          style={{
            zIndex: 4,
            padding: '14px 16px',
            borderRadius: '20px',
            backgroundColor: 'rgba(23, 11, 6, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(201, 160, 107, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span
              className="font-mono"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-gold)',
              }}
            >
              {styleName}
            </span>
            <IconFilmReel size={14} color="var(--accent-gold)" />
          </div>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#FBEFE1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            {title}
          </p>
        </div>

        {/* Background Grid Accent inside Phone */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(201, 160, 107, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 160, 107, 0.04) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      </motion.div>
    </div>
  );
};

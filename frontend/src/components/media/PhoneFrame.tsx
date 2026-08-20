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
          borderRadius: '36px',
          border: '3px solid var(--line)',
          boxShadow: isHovered ? '0 30px 60px -20px rgba(201, 160, 107, 0.4)' : 'var(--shadow)',
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
        {/* Top Speaker Notch */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '14px',
            backgroundColor: '#0F0704',
            borderRadius: '10px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '4px',
              backgroundColor: 'rgba(251, 239, 225, 0.2)',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Real HTML5 / YouTube Video Overlay when playing */}
        {isPlaying ? (
          <div style={{ position: 'absolute', inset: 0, zIndex: 6, backgroundColor: '#000' }}>
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
                    background: 'rgba(0,0,0,0.75)',
                    color: '#FBEFE1',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '100px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
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
                  background: 'rgba(0,0,0,0.75)',
                  color: '#FBEFE1',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '100px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: 'auto',
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
              opacity: 0.65,
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Header Tags inside Phone */}
        <div
          style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <Badge variant="gold" size="small">
            {formatLabel}
          </Badge>
          <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(251, 239, 225, 0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
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
            zIndex: 2,
            margin: 'auto 0',
          }}
        >
          <motion.div
            animate={{ scale: isHovered ? 1.15 : 1 }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(201, 160, 107, 0.25)',
              border: '1.5px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <IconPlay size={24} color="var(--accent-gold)" />
          </motion.div>
          <span
            className="font-mono"
            style={{
              fontSize: '10px',
              color: 'var(--accent-gold)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {videoUrl ? 'Click to Play Video' : 'Preview Sample Edit'}
          </span>
        </div>

        {/* Footer Info inside Phone */}
        <div
          style={{
            zIndex: 2,
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: 'rgba(36, 18, 9, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(251, 239, 225, 0.15)',
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '10px',
              color: 'var(--accent-gold)',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            {styleName}
          </span>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FBEFE1',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
            backgroundImage: `linear-gradient(to right, rgba(201, 160, 107, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 160, 107, 0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};

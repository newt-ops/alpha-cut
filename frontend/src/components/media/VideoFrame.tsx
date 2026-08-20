import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { IconPlay, IconClose, IconVolume, IconVolumeMute } from '@icons/icons';

const parseYouTubeId = (url: string | null): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export interface VideoFrameProps {
  title?: string;
  styleName?: string;
  duration?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  className?: string;
}

export const VideoFrame: React.FC<VideoFrameProps> = ({
  title = 'Long-Form Video Edit',
  styleName = '16:9 Format Edit',
  duration = '4:20',
  videoUrl = '',
  thumbnailUrl = '',
  className = '',
}) => {
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

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  const handleVideoError = () => {
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
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleStartPlay}
      animate={{ scale: isHovered && !isPlaying ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        backgroundColor: '#170B06',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--line)',
        boxShadow: isHovered ? '0 20px 40px -15px rgba(201, 160, 107, 0.3)' : 'var(--shadow-sm)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        color: '#FBEFE1',
        cursor: 'pointer',
      }}
      className={`video-frame-wrapper ${className}`}
    >
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

          {/* Video Controls Bar */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              right: '16px',
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

      {/* Cover Thumbnail Image */}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <Badge variant="gold" size="small">16:9 WIDESCREEN</Badge>
        <span className="font-mono" style={{ fontSize: '11px', color: 'rgba(251,239,225,0.9)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          {duration}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto 0', zIndex: 2 }}>
        <motion.div
          animate={{ scale: isHovered ? 1.15 : 1 }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 160, 107, 0.25)',
            border: '2px solid var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          <IconPlay size={28} color="var(--accent-gold)" />
        </motion.div>
      </div>

      <div
        style={{
          zIndex: 2,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(36, 18, 9, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(251, 239, 225, 0.15)',
        }}
      >
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>
          {styleName}
        </span>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#FBEFE1' }}>{title}</h4>
      </div>

      {/* Grid Pattern Accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(201, 160, 107, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(201, 160, 107, 0.05) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
};

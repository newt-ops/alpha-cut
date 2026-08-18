import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconFilm, IconZap, IconShield, IconExternalLink, IconSparkles } from '@icons/icons';

const FounderCard = ({ founder }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const showOverlay = isRevealed || isHovered;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)',
        backgroundColor: 'var(--surface)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-smooth)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Full Background Portrait */}
      <img
        src={founder.image}
        alt={`${founder.name} Portrait`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
        }}
      />

      {/* Default Bottom Scrim Bar (Visible when not revealed) */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 24px 24px 24px',
          background: 'linear-gradient(to top, rgba(15, 7, 4, 0.95) 0%, rgba(15, 7, 4, 0.75) 55%, transparent 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          transition: 'opacity 300ms ease',
          opacity: showOverlay ? 0 : 1,
          pointerEvents: showOverlay ? 'none' : 'auto',
        }}
      >
        <Badge variant="gold" size="small">{founder.role}</Badge>
        <h2 className="font-display" style={{ fontSize: '32px', color: '#FBEFE1', margin: 0, fontWeight: 800 }}>
          {founder.name}
        </h2>
        <p className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)', margin: 0, lineHeight: 1.4 }}>
          {founder.specialty}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsRevealed(true);
          }}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            borderRadius: '100px',
            backgroundColor: 'rgba(201, 160, 107, 0.2)',
            border: '1px solid var(--accent-gold)',
            color: '#FBEFE1',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span>Tap to Reveal Bio & Skills</span>
          <IconSparkles size={14} color="var(--accent-gold)" />
        </button>
      </div>

      {/* Interactive Glassmorphism Slide-Up Reveal Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3,
          backgroundColor: 'rgba(23, 11, 6, 0.93)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease',
          transform: showOverlay ? 'translateY(0%)' : 'translateY(102%)',
          opacity: showOverlay ? 1 : 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <Badge variant="gold" size="small">{founder.role}</Badge>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsRevealed(false);
                setIsHovered(false);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                color: '#FBEFE1',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Show Photo"
            >
              <IconClose size={14} />
            </button>
          </div>

          <h2 className="font-display" style={{ fontSize: '28px', color: '#FBEFE1', marginBottom: '4px' }}>
            {founder.name}
          </h2>
          <p className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '16px' }}>
            SPECIALTY: {founder.specialty}
          </p>

          <p style={{ fontSize: '14px', color: '#C9B8A8', lineHeight: 1.6, marginBottom: '20px' }}>
            {founder.bio}
          </p>
        </div>

        <div>
          <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '10px' }}>
            CORE SKILLS & FOCUS:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {founder.skills.map((skill, idx) => (
              <Badge key={idx} variant="surface" size="small" style={{ backgroundColor: 'rgba(251, 239, 225, 0.1)', color: '#FBEFE1' }}>
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AboutPage = () => {
  const [activeFounder, setActiveFounder] = useState('both');

  const founders = [
    {
      id: 'amir',
      name: 'Amir',
      role: 'Co-Founder & Lead Video Editor',
      specialty: 'Kinetic Motion Graphics, Pacing & Visual Storytelling',
      image: '/amir-portrait.jpg',
      bio: 'Amir leads creative direction and rhythm editing at Alpha Cut. Specializing in high-retention short-form cuts, kinetic typography, and visual pattern interrupts that turn raw video into viral content.',
      skills: ['Kinetic Typography', 'Sound Design (SFX)', 'Viral Pacing', 'Color Grading', 'Documentary B-Roll Sync'],
    },
    {
      id: 'aymen',
      name: 'Aymen',
      role: 'Co-Founder, Full-Stack Developer & Video Editor',
      specialty: 'Technical Systems, App Development & SaaS Animations',
      image: '/aymen-portrait.jpg',
      bio: 'Aymen bridges tech and creative craft — building full-stack web applications and crafting high-converting SaaS product animations, app walkthroughs, and UI motion graphics for startups.',
      skills: ['Full-Stack Web Engineering', 'SaaS Product Motion', 'UI Vector Animation', 'System Architecture', 'Client Dashboard Logic'],
    },
  ];

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="about-page">
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <Badge variant="gold">Founders & Vision</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Meet Amir & Aymen
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Alpha Cut was built by two creators combining technical system engineering with elite video craft to give brands and creators unfair retention leverage.
        </p>
      </div>

      {/* Founder Profile Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px' }}>
        <button
          onClick={() => setActiveFounder('both')}
          style={{
            padding: '8px 20px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeFounder === 'both' ? 'var(--accent-gold)' : 'var(--surface)',
            color: activeFounder === 'both' ? '#170B06' : 'var(--ink)',
            border: `1px solid ${activeFounder === 'both' ? 'var(--accent-gold)' : 'var(--line)'}`,
          }}
        >
          Both Founders
        </button>
        <button
          onClick={() => setActiveFounder('amir')}
          style={{
            padding: '8px 20px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeFounder === 'amir' ? 'var(--accent-gold)' : 'var(--surface)',
            color: activeFounder === 'amir' ? '#170B06' : 'var(--ink)',
            border: `1px solid ${activeFounder === 'amir' ? 'var(--accent-gold)' : 'var(--line)'}`,
          }}
        >
          Amir (Video Editor)
        </button>
        <button
          onClick={() => setActiveFounder('aymen')}
          style={{
            padding: '8px 20px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: activeFounder === 'aymen' ? 'var(--accent-gold)' : 'var(--surface)',
            color: activeFounder === 'aymen' ? '#170B06' : 'var(--ink)',
            border: `1px solid ${activeFounder === 'aymen' ? 'var(--accent-gold)' : 'var(--line)'}`,
          }}
        >
          Aymen (Developer & Editor)
        </button>
      </div>

      {/* Founder Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '60px' }}>
        {founders
          .filter((f) => activeFounder === 'both' || activeFounder === f.id)
          .map((founder) => (
            <FounderCard key={founder.id} founder={founder} />
          ))}
      </div>

      {/* Agency Story Section */}
      <section
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '50px 36px',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <Badge variant="gold">Agency Story</Badge>
        <h2 className="font-display" style={{ fontSize: '32px', marginTop: '12px' }}>
          How Alpha Cut Works
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '16px', lineHeight: 1.7, maxWidth: '720px', margin: '16px auto 0 auto' }}>
          Alpha Cut was created with a clear positioning: video editing is not a commodity service — it is the highest-leverage growth channel for modern brands. Amir brings artistic pacing and kinetic visual rhythm; Aymen brings technical systems, product animations, and seamless client portal engineering. Together, we handle the entire process from raw footage to high-converting asset delivery.
        </p>

        {/* Developer Credit Verification Box */}
        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--line)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
            Web Architecture & System Engineering:
          </span>
          <a
            href="https://aymen10.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            AYMEN10.NETLIFY.APP <IconExternalLink size={14} />
          </a>
        </div>
      </section>
    </div>
  );
};

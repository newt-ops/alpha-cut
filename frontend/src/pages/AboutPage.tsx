import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconFilm, IconZap, IconShield, IconExternalLink, IconSparkles, IconClose } from '@icons/icons';

interface Founder {
  name: string;
  role: string;
  specialty: string;
  image: string;
  bio: string;
  skills: string[];
  portfolioHighlight: string;
  socialLink: string;
  socialHandle: string;
}

const FounderCard: React.FC<{ founder: Founder }> = ({ founder }) => {
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
          type="button"
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
          inset: 0,
          zIndex: 3,
          backgroundColor: 'rgba(15, 7, 4, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 450ms cubic-bezier(0.16, 1, 0.3, 1)',
          transform: showOverlay ? 'translateY(0%)' : 'translateY(102%)',
          opacity: showOverlay ? 1 : 0,
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <Badge variant="gold" size="small">{founder.role}</Badge>
              <h3 className="font-display" style={{ fontSize: '28px', color: '#FBEFE1', margin: '4px 0 0 0', fontWeight: 800 }}>
                {founder.name}
              </h3>
            </div>
            {isRevealed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevealed(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FBEFE1',
                  cursor: 'pointer',
                }}
              >
                <IconClose size={16} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '13px', color: 'rgba(251, 239, 225, 0.85)', lineHeight: 1.6, marginBottom: '20px' }}>
            {founder.bio}
          </p>

          <div style={{ marginBottom: '20px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
              SPECIALIZED TOOLING & EDITING CRAFT:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {founder.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(201, 160, 107, 0.15)',
                    border: '1px solid rgba(201, 160, 107, 0.3)',
                    color: '#FBEFE1',
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px', letterSpacing: '0.05em' }}>
              SIGNATURE PROOF & CREATIVE BENCHMARK:
            </span>
            <p style={{ fontSize: '12px', color: 'rgba(251, 239, 225, 0.7)', fontStyle: 'italic', margin: 0 }}>
              "{founder.portfolioHighlight}"
            </p>
          </div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(251, 239, 225, 0.1)' }}>
          <a
            href={founder.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-gold)',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <span>Connect on Telegram (@{founder.socialHandle})</span>
            <IconExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const founders: Founder[] = [
    {
      name: 'Amir',
      role: 'Co-Founder & Lead Editor',
      specialty: 'Kinetic Motion Graphics & Sound Design Architecture',
      image: '/amir-portrait.jpg',
      bio: 'Amir leads the visual storytelling engine at Alpha Cut. Specializing in high-retention short-form edits, kinetic typography callouts, and multi-layered sound design, he transforms standard video footage into viral content.',
      skills: ['Adobe Premiere Pro', 'After Effects', 'Kinetic Typography', 'Sound Design SFX', 'Color Grading'],
      portfolioHighlight: 'Engineered 90%+ retention short-form edits for top tech & productivity creators.',
      socialLink: 'https://t.me/amirae62',
      socialHandle: 'amirae62',
    },
    {
      name: 'Aymen',
      role: 'Co-Founder & Executive Director',
      specialty: 'Client Strategy & Cinematic Editorial Direction',
      image: '/aymen-portrait.jpg',
      bio: 'Aymen manages agency strategy, long-form documentary workflows, and client success. Overseeing both technical editing pipelines and custom proposals, he ensures every project meets international broadcast standards.',
      skills: ['Documentary Pacing', 'Client Workflow Systems', 'Color Correction', 'Long-Form Editing', 'SaaS Demos'],
      portfolioHighlight: 'Directed full post-production pipelines for founder personal brands and SaaS walkthroughs.',
      socialLink: 'https://t.me/Leo_rnn',
      socialHandle: 'Leo_rnn',
    },
  ];

  return (
    <div style={{ padding: '40px 0 80px 0', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Badge variant="gold" size="medium">MEET THE FOUNDERS & STUDIO</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(34px, 5.5vw, 56px)', fontWeight: 800, marginTop: '16px', color: 'var(--ink)' }}>
          The Editors Behind Alpha Cut
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', maxWidth: '680px', margin: '16px auto 0 auto', lineHeight: 1.6 }}>
          Founded by Amir & Aymen, Alpha Cut is an elite video editing studio dedicated to helping creators, personal brands, and software companies dominate viewer retention.
        </p>
      </div>

      {/* Founder Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '36px', marginBottom: '80px' }}>
        {founders.map((f, i) => (
          <FounderCard key={i} founder={f} />
        ))}
      </div>

      {/* Agency Editorial Workflow Section */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '60px 40px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Badge variant="gold">PRODUCTION PIPELINE</Badge>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginTop: '12px' }}>
            Our 4-Step Editing Workflow
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '15px', maxWidth: '560px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
            From raw camera files to studio-rendered MP4 deliverables in 48 hours.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '24px' }}>
          {[
            { step: '01', title: 'Upload & Briefing', desc: 'Drop raw footage and reference links directly into your private client portal.' },
            { step: '02', title: 'Hook & Retention Edit', desc: 'We structure the 3-second hook, trim filler words, and apply kinetic cuts.' },
            { step: '03', title: 'SFX & Color Master', desc: 'Audio levelling, whooshes/risers SFX, and custom LUT color grading applied.' },
            { step: '04', title: 'Render & Revisions', desc: 'Download high-bitrate MP4 renders with up to 3 included revision cycles.' },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--bg)',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                {item.step}
              </span>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

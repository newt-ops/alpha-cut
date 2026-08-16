import React, { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { IconFilm, IconZap, IconShield, IconExternalLink } from '@icons/icons';

export const AboutPage = () => {
  const [activeFounder, setActiveFounder] = useState('both');

  const founders = [
    {
      id: 'amir',
      name: 'Amir',
      role: 'Co-Founder & Lead Video Editor',
      specialty: 'Kinetic Motion Graphics, Pacing & Visual Storytelling',
      bio: 'Amir leads creative direction and rhythm editing at Alpha Cut. Specializing in high-retention short-form cuts, kinetic typography, and visual pattern interrupts that turn raw video into viral content.',
      skills: ['Kinetic Typography', 'Sound Design (SFX)', 'Viral Pacing', 'Color Grading', 'Documentary B-Roll Sync'],
    },
    {
      id: 'aymen',
      name: 'Aymen',
      role: 'Co-Founder, Full-Stack Developer & Video Editor',
      specialty: 'Technical Systems, App Development & SaaS Animations',
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
            <div
              key={founder.id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '36px 30px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div>
                {/* Photo Placeholder Frame */}
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg)',
                    border: '1px dashed var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    textAlign: 'center',
                  }}
                >
                  <IconFilm size={36} color="var(--accent-gold)" style={{ marginBottom: '8px' }} />
                  <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                    [FOUNDER PHOTO PLACEHOLDER]
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    {founder.name} portrait coming soon
                  </span>
                </div>

                <Badge variant="gold" size="small">{founder.role}</Badge>
                <h2 className="font-display" style={{ fontSize: '28px', marginTop: '8px', marginBottom: '4px' }}>
                  {founder.name}
                </h2>
                <p className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                  SPECIALTY: {founder.specialty}
                </p>

                <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
                  {founder.bio}
                </p>

                <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '12px' }}>
                  CORE SKILLS & FOCUS:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {founder.skills.map((skill, idx) => (
                    <Badge key={idx} variant="surface" size="small">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
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

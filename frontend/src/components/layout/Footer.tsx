import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@components/ui/Logo';
import { IconTiktok, IconInstagram, IconTelegram, IconYoutube } from '@icons/icons';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        padding: '60px 24px 32px 24px',
        marginTop: 'auto',
        transition: 'background-color var(--transition-smooth)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Brand Info */}
        <div>
          <Logo size="medium" />
          <p
            style={{
              fontSize: '14px',
              color: 'var(--ink-soft)',
              marginTop: '16px',
              lineHeight: 1.6,
              maxWidth: '300px',
            }}
          >
            High-impact, retention-focused video editing for creators, brands, and agencies worldwide.
          </p>
        </div>

        {/* Sitemap Navigation */}
        <div>
          <h4
            className="font-mono"
            style={{
              fontSize: '12px',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            Navigation
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <Link to="/" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/editing-styles" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                Editing Styles
              </Link>
            </li>
            <li>
              <Link to="/portfolio" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/packages" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                Packages & Pricing
              </Link>
            </li>
            <li>
              <Link to="/about" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                About Amir & Aymen
              </Link>
            </li>
            <li>
              <Link to="/ratings" style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                Client Ratings
              </Link>
            </li>
          </ul>
        </div>

        {/* Agency Info & Contact */}
        <div>
          <h4
            className="font-mono"
            style={{
              fontSize: '12px',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            Contact & Agency
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
            Official Email:
          </p>
          <a
            href="mailto:alphacutagency@gmail.com"
            style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
          >
            alphacutagency@gmail.com
          </a>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '16px' }}>
            Founders: Amir & Aymen
          </p>
        </div>

        {/* Social Media Links Column */}
        <div>
          <h4
            className="font-mono"
            style={{
              fontSize: '12px',
              color: 'var(--accent-gold)',
              marginBottom: '16px',
            }}
          >
            Follow & Connect
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://www.youtube.com/@alpha-cut-co"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
            >
              <IconYoutube size={18} /> @alpha-cut-co
            </a>
            <a
              href="https://www.tiktok.com/@alphacut.ae"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
            >
              <IconTiktok size={18} /> @alphacut.ae
            </a>
            <a
              href="https://www.instagram.com/alphacut.ae"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
            >
              <IconInstagram size={18} /> @alphacut.ae
            </a>
            <a
              href="https://t.me/Alphacut_co"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'var(--ink-soft)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
            >
              <IconTelegram size={18} /> @Alphacut_co
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar & Submitting Credit */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
          &copy; {new Date().getFullYear()} Alpha Cut Agency. All rights reserved.
        </p>

        {/* Developer Credit */}
        <a
          href="https://aymen10.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono"
          style={{
            fontSize: '11px',
            color: 'var(--ink-soft)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-soft)')}
        >
          Developed by AYMEN10.NETLIFY.APP
        </a>
      </div>
    </footer>
  );
};

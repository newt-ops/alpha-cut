import React from 'react';
import { Badge } from '@components/ui/Badge';
import { motion } from 'framer-motion';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 24px 100px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="gold">Legal & Transparency</Badge>
          <h1 className="font-display" style={{ fontSize: '38px', margin: '16px 0 12px 0', color: 'var(--ink)' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', margin: 0 }}>
            Last updated: August 25, 2026 &bull; Effective for alpha-cut.com and related subdomains
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 36px',
            fontSize: '15px',
            lineHeight: 1.7,
            color: 'var(--ink-soft)',
          }}
        >
          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: 0 }}>
            1. Overview
          </h2>
          <p>
            Alpha Cut Agency (&ldquo;Alpha Cut&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) respects your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, process, store, and safeguard information across our website (<strong>alpha-cut.com</strong>), backend systems, client portal, and related services.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            2. Data We Collect
          </h2>
          <p>We collect information necessary to deliver video editing retainers, manage project assets, and handle secure communications:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>Account Information:</strong> Full name, email address, password hash, and optional profile avatar.</li>
            <li><strong>Google OAuth Data:</strong> Email, name, and profile picture URL when authenticating via Google Sign-In.</li>
            <li><strong>Project Deliverables & Media:</strong> Video footage, project briefs, brand assets, and feedback stored via secure cloud storage (Cloudinary).</li>
            <li><strong>Technical & Session Data:</strong> IP addresses, browser user-agent details, security tokens, and authentication cookies.</li>
          </ul>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            3. How We Use Your Data
          </h2>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li>To manage client editing accounts, deliverable timelines, and monthly retainer packages.</li>
            <li>To send transactional emails (verification codes, password reset links, deliverable updates) via Resend.</li>
            <li>To authenticate sessions securely across our domain ecosystem (`.alpha-cut.com`).</li>
            <li>To protect our infrastructure against unauthorized access, spam, and abuse.</li>
          </ul>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            4. Data Sharing & Third-Party Services
          </h2>
          <p>We do not sell or rent personal information to third parties. We integrate only with trusted infrastructure providers required for agency operations:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>MongoDB Atlas:</strong> Encrypted database hosting.</li>
            <li><strong>Cloudinary:</strong> Media asset storage and video streaming optimization.</li>
            <li><strong>Resend API:</strong> Transactional email dispatch.</li>
            <li><strong>Google OAuth:</strong> Secure single-sign-on verification.</li>
          </ul>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            5. Cookies & Authentication Tokens
          </h2>
          <p>
            We use HTTP-only secure cookies (`alpha_cut_refresh` & `alpha_cut_oauth_state`) scoped to `.alpha-cut.com` to maintain your session securely across client and admin dashboards without exposing raw access tokens.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            6. Your Data Rights & Contact
          </h2>
          <p>
            You have the right to request access to your account data, correction of inaccuracies, or deletion of your client account. For privacy inquiries, please contact us at <a href="mailto:alphacutagency@gmail.com" style={{ color: 'var(--accent-gold)' }}>alphacutagency@gmail.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

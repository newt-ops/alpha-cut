import React from 'react';
import { Badge } from '@components/ui/Badge';
import { motion } from 'framer-motion';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 24px 100px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="gold">Legal Agreement</Badge>
          <h1 className="font-display" style={{ fontSize: '38px', margin: '16px 0 12px 0', color: 'var(--ink)' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', margin: 0 }}>
            Last updated: August 25, 2026 &bull; Alpha Cut Agency Terms & Conditions
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
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing <strong>alpha-cut.com</strong>, subscribing to our monthly video retainers, or engaging Alpha Cut Agency (&ldquo;Alpha Cut&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) for video editing services, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            2. Video Editing Services & Monthly Retainers
          </h2>
          <p>
            Alpha Cut provides high-impact retention video editing services, including short-form content creation, viral animation breakdowns, podcast cutdowns, and monthly client retainers as described in your active service package or proposal contract.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            3. Client Deliverables & Raw Media Responsibilities
          </h2>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li>Clients must provide raw video footage, branding guidelines, and clear asset links in a timely manner to maintain deliverable schedules.</li>
            <li>Clients warrant that all uploaded footage, audio files, and brand logos do not infringe upon any third-party copyrights or trademark rights.</li>
          </ul>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            4. Revisions & Turnaround Policy
          </h2>
          <p>
            Standard turnaround times and included revision rounds are governed by your specific plan tier (e.g., Starter, Growth, Agency Scale). Revisions must be submitted through our structured feedback portal within 7 business days of deliverable release.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            5. Intellectual Property & License
          </h2>
          <p>
            Upon full payment of invoice or monthly retainer fees, clients receive full commercial ownership rights to the final rendered video deliverables. Alpha Cut reserves the right to showcase completed non-confidential edits in our agency portfolio and marketing channels unless a non-disclosure agreement (NDA) is explicitly executed.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            6. Contact & Support
          </h2>
          <p>
            For questions regarding contracts or service terms, reach out to our agency team at <a href="mailto:alphacutagency@gmail.com" style={{ color: 'var(--accent-gold)' }}>alphacutagency@gmail.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

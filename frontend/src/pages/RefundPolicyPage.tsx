import React from 'react';
import { Badge } from '@components/ui/Badge';
import { motion } from 'framer-motion';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '60px 24px 100px 24px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Badge variant="gold">Guarantee & Terms</Badge>
          <h1 className="font-display" style={{ fontSize: '38px', margin: '16px 0 12px 0', color: 'var(--ink)' }}>
            Refund & Cancellation Policy
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--ink-soft)', margin: 0 }}>
            Last updated: August 25, 2026 &bull; Alpha Cut Agency Payment & Refund Terms
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
            1. Satisfaction & Quality Guarantee
          </h2>
          <p>
            At Alpha Cut Agency, we take pride in delivering top-tier, retention-focused video edits. We work closely with every client through initial style alignment, sample edits, and structured revision rounds to ensure complete satisfaction.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            2. Monthly Retainer Cancellations
          </h2>
          <p>
            Client retainers operate on a monthly recurring billing cycle. Clients may pause or cancel their retainer subscription at any time by giving written notice at least 7 days prior to the next billing renewal date. Cancellations take effect at the end of the current paid billing period.
          </p>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            3. Refund Eligibility
          </h2>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li><strong>Before Work Begins:</strong> If you request a cancellation prior to our editors commencing work or setting up your project timeline, a full 100% refund will be issued.</li>
            <li><strong>In-Progress Editing:</strong> Once editing work has commenced or custom assets have been produced, payments are non-refundable. However, unused edit credits roll over or can be applied toward future projects.</li>
            <li><strong>Delivered Works:</strong> Completed, rendered video deliverables delivered in accordance with client specifications are non-refundable.</li>
          </ul>

          <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginTop: '32px' }}>
            4. Contacting Support
          </h2>
          <p>
            If you have questions about an invoice or wish to adjust your monthly editing retainer, please contact our support team directly at <a href="mailto:alphacutagency@gmail.com" style={{ color: 'var(--accent-gold)' }}>alphacutagency@gmail.com</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

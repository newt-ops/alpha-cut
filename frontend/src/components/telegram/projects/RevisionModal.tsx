import React, { useState } from 'react';
import { Project } from '../../../types';
import { TelegramModal } from '../common/TelegramModal';
import { triggerHaptic } from '../../../utils/telegramSdk';

interface RevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmit: (notes: string) => Promise<void>;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
}) => {
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    try {
      setSubmitting(true);
      triggerHaptic('medium');
      await onSubmit(revisionNotes.trim());
      setRevisionNotes('');
      onClose();
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TelegramModal isOpen={isOpen} onClose={onClose} title="Request Edit Revision">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <p style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color, #708499)', margin: 0 }}>
          Describe the exact timestamps and changes you want revised for{' '}
          <strong style={{ color: 'var(--tg-theme-text-color, #ffffff)' }}>{project?.editingStyle}</strong>.
        </p>
        <textarea
          value={revisionNotes}
          onChange={(e) => setRevisionNotes(e.target.value)}
          placeholder="e.g. At 0:14 change caption highlight color, add sound effect at 0:28..."
          rows={4}
          required
          style={{
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(120, 120, 128, 0.2)',
            borderRadius: '10px',
            padding: '12px',
            color: 'var(--tg-theme-text-color, #ffffff)',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'var(--tg-theme-button-color, #5288c1)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Revision Request'}
        </button>
      </form>
    </TelegramModal>
  );
};

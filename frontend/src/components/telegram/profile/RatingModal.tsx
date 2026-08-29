import React, { useState } from 'react';
import { Project } from '../../../types';
import { Modal } from '@components/ui/Modal';
import { StarRating } from '@components/ui/StarRating';
import { triggerHaptic } from '../../../utils/telegramSdk';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmit: (stars: number, review: string) => Promise<void>;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  project,
  onSubmit,
}) => {
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingReview.trim()) return;

    try {
      setSubmitting(true);
      triggerHaptic('medium');
      await onSubmit(ratingStars, ratingReview.trim());
      setRatingReview('');
      onClose();
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Video Editing Service">
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <p style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color, #708499)', margin: 0 }}>
          Rate your experience with{' '}
          <strong style={{ color: 'var(--tg-theme-text-color, #ffffff)' }}>{project?.editingStyle}</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <StarRating
            rating={ratingStars}
            interactive
            onChange={(val) => {
              triggerHaptic('light');
              setRatingStars(val);
            }}
            size="large"
          />
        </div>

        <textarea
          value={ratingReview}
          onChange={(e) => setRatingReview(e.target.value)}
          placeholder="What did you love about this edit? (Pacing, sound design, graphics...)"
          rows={3}
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
            height: '42px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'var(--tg-theme-button-color, #5288c1)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </Modal>
  );
};

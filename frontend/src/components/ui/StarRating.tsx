import React, { useState } from 'react';
import { IconStar } from '@icons/icons';

export interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  interactive?: boolean;
  size?: number | 'small' | 'medium' | 'large';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 5,
  onChange,
  readOnly = true,
  interactive,
  size = 20,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isReadOnly = interactive !== undefined ? !interactive : readOnly;

  const numericSize =
    typeof size === 'number'
      ? size
      : size === 'small'
      ? 16
      : size === 'large'
      ? 28
      : 20;

  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={`star-rating-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: isReadOnly ? 'default' : 'pointer',
      }}
    >
      {stars.map((star) => {
        const isFilled = isReadOnly
          ? star <= Math.round(rating)
          : star <= (hoverRating || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={isReadOnly}
            aria-label={`${star} out of 5 stars`}
            onClick={() => !isReadOnly && onChange && onChange(star)}
            onMouseEnter={() => !isReadOnly && setHoverRating(star)}
            onMouseLeave={() => !isReadOnly && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: isReadOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
            }}
          >
            <IconStar size={numericSize} filled={isFilled} color="var(--accent-gold)" />
          </button>
        );
      })}
    </div>
  );
};

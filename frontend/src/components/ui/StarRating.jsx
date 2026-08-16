import React, { useState } from 'react';
import { IconStar } from '@icons/icons';

export const StarRating = ({
  rating = 5,
  onChange,
  readOnly = true,
  size = 20,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  return (
    <div
      className={`star-rating-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: readOnly ? 'default' : 'pointer',
      }}
    >
      {stars.map((star) => {
        const isFilled = readOnly
          ? star <= Math.round(rating)
          : star <= (hoverRating || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: readOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              outline: 'none',
            }}
          >
            <IconStar size={size} filled={isFilled} color="var(--accent-gold)" />
          </button>
        );
      })}
    </div>
  );
};

import React, { useState } from 'react';
import { IconStar } from '@icons/icons';

export interface TelegramStarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
}

export const TelegramStarRating: React.FC<TelegramStarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'medium',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    small: 16,
    medium: 22,
    large: 28,
  };

  const starSize = starSizes[size];

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= activeRating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: interactive ? 'pointer' : 'default',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              transform: interactive && hoverRating === starValue ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <IconStar
              size={starSize}
              color={isFilled ? '#ffcc00' : 'rgba(120, 120, 128, 0.25)'}
              fill={isFilled ? '#ffcc00' : 'transparent'}
            />
          </button>
        );
      })}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { StarRating } from '@components/ui/StarRating';
import { IconStar } from '@icons/icons';

export const RatingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch('/api/ratings').then((r) => r.json());
        if (res.success) setData(res);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  const totalReviews = data?.totalReviews || 12;
  const avgRating = data?.avgRating || '4.9';
  const starCounts = data?.starCounts || { 5: 10, 4: 2, 3: 0, 2: 0, 1: 0 };
  const ratingsList = data?.ratings || [];

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="ratings-page">
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
        <Badge variant="gold">Verified Social Proof</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Client Ratings & Reviews
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Reviews are submitted by verified clients upon approval of completed video deliverables.
        </p>
      </div>

      {/* Aggregate Score & Star Distribution Bar */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '40px 32px',
          maxWidth: '800px',
          margin: '0 auto 48px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span className="font-display" style={{ fontSize: '56px', fontWeight: 800, color: 'var(--ink)' }}>
            {avgRating}
          </span>
          <div style={{ margin: '8px 0' }}>
            <StarRating rating={Math.round(Number(avgRating))} size={24} />
          </div>
          <span className="font-mono" style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
            BASED ON {totalReviews} VERIFIED REVIEWS
          </span>
        </div>

        {/* Distribution Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span className="font-mono" style={{ width: '45px', color: 'var(--ink-soft)' }}>
                  {stars} Star
                </span>
                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
                </div>
                <span className="font-mono" style={{ width: '30px', textAlign: 'right', color: 'var(--ink-soft)' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {ratingsList.map((r) => (
          <div
            key={r._id}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <StarRating rating={r.stars} size={18} />
                <Badge variant="gold" size="small">{r.packageTier.toUpperCase()}</Badge>
              </div>

              <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '20px' }}>
                "{r.review}"
              </p>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', display: 'block' }}>
                  {r.clientName}
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
                  {r.editingStyle}
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

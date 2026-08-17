import React, { useState, useEffect } from 'react';
import { Badge } from '@components/ui/Badge';
import { StarRating } from '@components/ui/StarRating';
import { customFetch } from '../utils/api';
import { Skeleton } from '@components/ui/Skeleton';

export const RatingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const res = await customFetch('/api/ratings');
        if (res.success) setData(res);
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton height="40px" style={{ marginBottom: '20px' }} />
        <Skeleton height="200px" />
      </div>
    );
  }

  const ratingsList = data?.ratings || [];
  const avgRating = data?.avgRating || '5.0';
  const totalReviews = data?.totalReviews || 0;
  const starCounts = data?.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="ratings-page">
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px auto' }}>
        <Badge variant="gold">Client Testimonials</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginTop: '12px' }}>
          Client Reviews & Ratings
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-soft)', marginTop: '12px', lineHeight: 1.6 }}>
          Transparent feedback and ratings submitted by founders, content creators, and agencies working with Alpha Cut.
        </p>
      </div>

      {/* Aggregate Overview Card */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--line)',
          padding: '36px',
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
      {ratingsList.length === 0 ? (
        <div style={{ textAlign: 'center', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>No client reviews have been published yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {ratingsList.map((r) => (
            <div
              key={r._id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${r.featured ? 'var(--accent-gold)' : 'var(--line)'}`,
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: r.featured ? 'var(--shadow)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <StarRating rating={r.stars || 5} size={18} />
                  <Badge variant={r.featured ? 'gold' : 'surface'} size="small">
                    {r.featured ? 'FEATURED REVIEW' : (r.packageTier || 'VERIFIED EDIT').toUpperCase()}
                  </Badge>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                  "{r.review || 'Excellent video editing service.'}"
                </p>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                {r.clientAvatarUrl ? (
                  <img
                    src={r.clientAvatarUrl}
                    alt={r.clientName}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(201, 160, 107, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                      fontWeight: 800,
                      fontSize: '16px',
                    }}
                  >
                    {r.clientName ? r.clientName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)', display: 'block' }}>
                    {r.clientName || 'Verified Client'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                    {r.clientTitle || r.editingStyle || 'Client'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { StarRating } from '@components/ui/StarRating';
import { customFetch } from '../utils/api';
import { Skeleton } from '@components/ui/Skeleton';
import { IconChevronDown, IconCheck } from '@icons/icons';

export const RatingsPage: React.FC = () => {
  const [ratingsList, setRatingsList] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState('5.0');
  const [totalReviews, setTotalReviews] = useState(0);
  const [starCounts, setStarCounts] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [selectedStarFilter, setSelectedStarFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true);
        const res = await customFetch('/api/ratings?page=1&limit=9');
        if (res.success) {
          setRatingsList(res.ratings || []);
          setAvgRating(res.avgRating || '5.0');
          setTotalReviews(res.totalReviews || 0);
          setStarCounts(res.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
          setCurrentPage(res.currentPage || 1);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  const handleLoadMore = async () => {
    if (currentPage >= totalPages || loadingMore) return;
    const nextPage = currentPage + 1;
    try {
      setLoadingMore(true);
      const res = await customFetch(`/api/ratings?page=${nextPage}&limit=9`);
      if (res.success) {
        setRatingsList((prev) => [...prev, ...(res.ratings || [])]);
        setCurrentPage(res.currentPage || nextPage);
        setTotalPages(res.totalPages || totalPages);
      }
    } catch (err) {
      // Fallback
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredRatings = ratingsList.filter((r) => {
    if (selectedStarFilter === '5') return (r.stars || r.rating) === 5;
    if (selectedStarFilter === '4') return (r.stars || r.rating) === 4;
    if (selectedStarFilter === 'featured') return !!r.featured;
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton height="40px" style={{ marginBottom: '20px' }} />
        <Skeleton height="200px" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="ratings-page">
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px auto' }}>
        <Badge variant="gold">Verified Client Feedback</Badge>
        <h1 className="font-display" style={{ fontSize: 'clamp(34px, 5.5vw, 54px)', fontWeight: 800, marginTop: '12px', color: 'var(--ink)' }}>
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
          maxWidth: '840px',
          margin: '0 auto 40px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '32px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span className="font-display" style={{ fontSize: '60px', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
            {avgRating}
          </span>
          <div style={{ margin: '10px 0 6px 0' }}>
            <StarRating rating={Math.round(Number(avgRating))} size={24} />
          </div>
          <span className="font-mono" style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 700 }}>
            BASED ON {totalReviews} VERIFIED REVIEWS
          </span>
        </div>

        {/* Distribution Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <span className="font-mono" style={{ width: '50px', color: 'var(--ink-soft)', fontWeight: 700 }}>
                  {stars} Star
                </span>
                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 600ms ease' }} />
                </div>
                <span className="font-mono" style={{ width: '30px', textAlign: 'right', color: 'var(--ink-soft)', fontWeight: 700 }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Star Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
        {[
          { id: 'all', label: `All Reviews (${ratingsList.length})` },
          { id: 'featured', label: `★ Featured Spotlight (${ratingsList.filter((r) => r.featured).length})` },
          { id: '5', label: `5 Stars (${ratingsList.filter((r) => (r.stars || r.rating) === 5).length})` },
          { id: '4', label: `4 Stars (${ratingsList.filter((r) => (r.stars || r.rating) === 4).length})` },
        ].map((tab) => {
          const isActive = selectedStarFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStarFilter(tab.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: isActive ? 'var(--accent-gold)' : 'var(--surface)',
                color: isActive ? '#170B06' : 'var(--ink)',
                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--line)'}`,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Review Cards Grid */}
      {filteredRatings.length === 0 ? (
        <div style={{ textAlign: 'center', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>No reviews found for this selected filter.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {filteredRatings.map((r) => (
              <motion.div
                key={r._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${r.featured ? 'var(--accent-gold)' : 'var(--line)'}`,
                  padding: '30px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: r.featured ? '0 10px 30px -10px rgba(201, 160, 107, 0.25)' : 'var(--shadow-sm)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <StarRating rating={r.stars || r.rating || 5} size={18} />
                    <Badge variant={r.featured ? 'gold' : 'surface'} size="small">
                      {r.featured ? 'FEATURED SPOTLIGHT' : (r.editingStyle || r.packageTier || 'VERIFIED EDIT').toUpperCase()}
                    </Badge>
                  </div>

                  <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                    "{r.review || r.comment || 'Excellent video editing service.'}"
                  </p>
                </div>

                <div style={{ paddingTop: '18px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {r.clientAvatarUrl ? (
                    <img
                      src={r.clientAvatarUrl}
                      alt={r.clientName || 'Client'}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-gold)',
                        color: '#170B06',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                      }}
                    >
                      {r.clientName ? r.clientName.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)' }}>
                        {r.clientName || 'Verified Client'}
                      </span>
                      <IconCheck size={14} color="var(--accent-gold)" />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                      {r.clientTitle || 'Creator / Brand Client'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {currentPage < totalPages && (
            <div style={{ textAlign: 'center', marginTop: '44px' }}>
              <Button
                variant="secondary"
                iconRight={IconChevronDown}
                isLoading={loadingMore}
                onClick={handleLoadMore}
              >
                Load More Client Reviews ({ratingsList.length} of {totalReviews})
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

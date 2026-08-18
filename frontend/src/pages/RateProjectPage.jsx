import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { StarRating } from '@components/ui/StarRating';
import { useToast } from '@components/ui/Toast';
import { IconCheck, IconStar, IconSparkles, IconArrowRight } from '@icons/icons';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export const RateProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/projects/${projectId}/rating-info`).then((r) => r.json());
        if (res.success && res.project) {
          setProject(res.project);
          if (res.project.rated) {
            setSubmitted(true);
          }
        } else {
          setError('Project details could not be found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!stars) {
      toast({ message: 'Please select a star rating.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('alpha_cut_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/ratings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          stars,
          review: review.trim(),
        }),
      }).then((r) => r.json());

      if (res.success) {
        toast({ message: 'Thank you! Your project review has been published.', type: 'success' });
        setSubmitted(true);
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to submit rating.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', color: 'var(--ink-soft)' }}>
        <p>Loading project review details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 24px' }}>
        <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)', marginBottom: '12px' }}>
          Invalid Rating Link
        </h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '24px' }}>{error || 'This project review link is invalid or expired.'}</p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Client Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 28px',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Badge variant="gold" size="small">Client Verification</Badge>
          <h1 className="font-display" style={{ fontSize: '28px', color: 'var(--ink)', marginTop: '12px' }}>
            Rate Your Video Delivery
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginTop: '6px' }}>
            Project: <strong style={{ color: 'var(--ink)' }}>{project.editingStyle}</strong> • Client: <strong style={{ color: 'var(--ink)' }}>{project.clientName}</strong>
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(201, 160, 107, 0.15)',
                border: '1px solid var(--accent-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <IconCheck size={32} color="var(--accent-gold)" />
            </div>
            <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', marginBottom: '8px' }}>
              Review Submitted!
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: '14px', marginBottom: '24px' }}>
              Thank you for working with Alpha Cut. Your feedback helps us maintain world-class editing standards.
            </p>
            <Link to="/dashboard">
              <Button variant="primary" iconRight={IconArrowRight}>Go to Client Dashboard</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitRating} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px', textAlign: 'center' }}>
                Your Star Rating
              </label>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <StarRating rating={stars} onChange={setStars} interactive size={32} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '8px' }}>
                Your Feedback & Experience (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Share your experience working with Alpha Cut..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--line)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <Button type="submit" variant="primary" isLoading={submitting} iconRight={IconSparkles}>
              Publish Review & Rating
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

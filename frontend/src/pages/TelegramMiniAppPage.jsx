import React, { useState, useEffect, useCallback } from 'react';
import { TelegramAppLayout } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Stepper } from '@components/ui/Stepper';
import { Modal } from '@components/ui/Modal';
import { StarRating } from '@components/ui/StarRating';
import { Textarea, Input } from '@components/ui/Input';
import { Tabs } from '@components/ui/Tabs';
import { customFetch } from '../utils/api';
import { useToast } from '@components/ui/Toast';
import { IconCheck, IconSparkles, IconExternalLink, IconZap, IconShield } from '@icons/icons';

export const TelegramMiniAppPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [unlinked, setUnlinked] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Account Linking Form State
  const [linkCode, setLinkCode] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);

  // Action Modals State
  const [selectedProject, setSelectedProject] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [projRes, contractRes, notifRes] = await Promise.all([
        customFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        customFetch('/api/contracts').catch(() => ({ success: false, contracts: [] })),
        customFetch('/api/notifications').catch(() => ({ success: false, notifications: [] })),
      ]);
      if (projRes.success) setProjects(projRes.projects);
      if (contractRes.success) setContracts(contractRes.contracts);
      if (notifRes.success) setNotifications(notifRes.notifications);
    } catch (err) {
      toast({ message: 'Failed to load Mini App data', type: 'error' });
    }
  }, [toast]);

  useEffect(() => {
    const authenticateMiniApp = async () => {
      setLoading(true);
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;

      if (!initData) {
        // If opened outside Telegram or initData missing, check existing session
        try {
          const meRes = await customFetch('/api/auth/me');
          if (meRes.success) {
            setUser(meRes.user);
            setIsAuthenticated(true);
            await fetchDashboardData();
          } else {
            setUnlinked(true);
          }
        } catch (err) {
          setUnlinked(true);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const authRes = await customFetch('/api/telegram/webapp/auth', {
          method: 'POST',
          body: JSON.stringify({ initData }),
        });

        if (authRes.success) {
          setUser(authRes.user);
          setIsAuthenticated(true);
          await fetchDashboardData();
        } else if (authRes.unlinked) {
          setUnlinked(true);
          setTelegramUser(authRes.telegramUser);
        } else {
          toast({ message: authRes.message || 'Telegram authentication failed', type: 'error' });
          setUnlinked(true);
        }
      } catch (err) {
        setUnlinked(true);
      } finally {
        setLoading(false);
      }
    };

    authenticateMiniApp();
  }, [fetchDashboardData, toast]);

  // Handle Account Linking via 6-digit Code inside Mini App
  const handleLinkAccount = async (e) => {
    e.preventDefault();
    if (!linkCode || linkCode.trim().length !== 6) {
      toast({ message: 'Please enter a valid 6-digit code', type: 'error' });
      return;
    }

    try {
      setSubmittingLink(true);
      const res = await customFetch('/api/telegram/link/code', {
        method: 'POST',
        body: JSON.stringify({ code: linkCode }),
      });

      if (res.success) {
        toast({ message: 'Account linked successfully!', type: 'success' });
        window.location.reload();
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to link account', type: 'error' });
    } finally {
      setSubmittingLink(false);
    }
  };

  const activeProjects = projects.filter(
    (p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered'
  );

  const activeContracts = contracts.filter(
    (c) => c.status === 'proposed' || c.status === 'active'
  );

  const getStepIndex = (status) => {
    switch (status) {
      case 'proposal_sent': return 0;
      case 'in_progress': return 1;
      case 'delivered': return 2;
      case 'completed': return 4;
      case 'declined': return 0;
      default: return 0;
    }
  };

  const stepperSteps = [
    { label: 'Proposal Sent' },
    { label: 'In Progress' },
    { label: 'Work Delivered' },
    { label: 'Approved & Completed' },
  ];

  const handleAcceptProposal = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal accepted! Project is in progress.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDelivery = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Delivery approved! Rating unlocked.', type: 'success' });
        fetchDashboardData();
        setSelectedProject(res.project);
        setRateModalOpen(true);
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptContract = async (contractId) => {
    try {
      setSubmitting(true);
      const res = await customFetch(`/api/contracts/${contractId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract accepted!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDeliverable = async (contractId, deliverableId) => {
    try {
      setSubmitting(true);
      const res = await customFetch(`/api/contracts/${contractId}/deliverables/${deliverableId}/approve`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Video deliverable approved!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedProject || !reviewText) {
      toast({ message: 'Please write a review before submitting.', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await customFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProject._id,
          stars: ratingStars,
          review: reviewText,
        }),
      });

      if (res.success) {
        toast({ message: 'Thank you for your rating & review!', type: 'success' });
        setRateModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TelegramAppLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Badge variant="gold">Mini App Launch</Badge>
          <h2 className="font-display" style={{ fontSize: '24px', marginTop: '12px' }}>Loading Alpha Cut Workspace...</h2>
        </div>
      </TelegramAppLayout>
    );
  }

  // UNLINKED SCREEN (Inside Telegram Mini App)
  if (unlinked && !isAuthenticated) {
    return (
      <TelegramAppLayout>
        <div style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <Badge variant="gold">Telegram Mini App</Badge>
          <h2 className="font-display" style={{ fontSize: '26px', marginTop: '12px', marginBottom: '8px' }}>
            Connect Your Alpha Cut Account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
            {telegramUser?.first_name ? `Welcome, ${telegramUser.first_name}! ` : ''}
            Link your Telegram account to track video project deliverables, inspect proposals, and approve edits.
          </p>

          <form onSubmit={handleLinkAccount} style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <Input
              label="Enter 6-Digit Linking Code"
              placeholder="e.g. 123456"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" fullWidth isLoading={submittingLink} iconRight={IconCheck}>
              Connect Account
            </Button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Don't have an account yet?{' '}
            <a href="https://alpha-cut-nine.vercel.app/signup" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              Register on Web Platform
            </a>
          </div>
        </div>
      </TelegramAppLayout>
    );
  }

  // AUTHENTICATED MINI APP WORKSPACE
  return (
    <TelegramAppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Badge variant="gold">Client Workspace</Badge>
          <h2 className="font-display" style={{ fontSize: '24px', marginTop: '4px' }}>
            {user?.name}
          </h2>
        </div>
        <Tabs
          tabs={[
            { id: 'overview', label: 'Track My Work' },
            { id: 'projects', label: 'History' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Active Retainer Contracts Section */}
          {activeContracts.map((contract) => {
            const delCount = contract.deliveredCount || 0;
            const planned = contract.totalVideosPlanned || 8;
            const pct = Math.min(100, Math.round((delCount / planned) * 100));

            return (
              <div key={contract._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-gold)', padding: '20px', boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="font-display" style={{ fontSize: '18px' }}>RETAINER: {contract.packageTier?.toUpperCase()}</h3>
                  <Badge variant="gold">{contract.status.toUpperCase()}</Badge>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                  {contract.monthlyPrice} {contract.currency}/mo ({contract.frequency})
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '4px' }}>
                    <span>Deliverables: {delCount}/{planned}</span>
                    <span className="font-mono">{pct}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)' }} />
                  </div>
                </div>

                {contract.status === 'proposed' && (
                  <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptContract(contract._id)}>
                    Accept Retainer Terms
                  </Button>
                )}

                {contract.deliverables && contract.deliverables.length > 0 && (
                  <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                    {contract.deliverables.map((d) => (
                      <div key={d._id} style={{ backgroundColor: 'var(--bg)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <div>
                          <strong>#{d.sequenceNumber}: {d.title || `Video Render #${d.sequenceNumber}`}</strong>
                        </div>
                        {d.status === 'delivered' ? (
                          <Button variant="primary" size="small" isLoading={submitting} onClick={() => handleApproveDeliverable(contract._id, d._id)}>
                            Approve
                          </Button>
                        ) : (
                          <Badge variant="success" size="small">APPROVED</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Active One-Off Projects Section */}
          {activeProjects.map((proj) => (
            <div
              key={proj._id}
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '24px 20px',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-display" style={{ fontSize: '20px' }}>{proj.editingStyle}</h3>
                <Badge variant="gold">{proj.status.replace('_', ' ').toUpperCase()}</Badge>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
              </div>

              <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', marginBottom: '16px', fontSize: '13px' }}>
                <div><strong>Terms:</strong> {proj.price} {proj.currency} ({proj.packageTier?.toUpperCase()})</div>
                <div style={{ color: 'var(--ink-soft)', marginTop: '4px' }}><strong>Deadline:</strong> {new Date(proj.deadline).toLocaleDateString()}</div>
              </div>

              {proj.status === 'proposal_sent' && (
                <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptProposal(proj._id)}>
                  Accept Proposal
                </Button>
              )}

              {proj.status === 'delivered' && (
                <Button variant="primary" fullWidth iconRight={IconSparkles} isLoading={submitting} onClick={() => handleApproveDelivery(proj._id)}>
                  Approve Delivery & Rate
                </Button>
              )}
            </div>
          ))}

          {activeProjects.length === 0 && activeContracts.length === 0 && (
            <div style={{ backgroundColor: 'var(--surface)', padding: '36px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No active proposals, retainers, or ongoing edits at this time.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map((proj) => (
            <div key={proj._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>{proj.status.replace('_', ' ').toUpperCase()}</Badge>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{new Date(proj.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-display" style={{ fontSize: '18px' }}>{proj.editingStyle}</h4>
              <p style={{ fontSize: '13px', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 700 }}>{proj.price} {proj.currency}</p>
            </div>
          ))}
        </div>
      )}

      {/* Rating & Review Modal */}
      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Rate Delivered Edit">
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <StarRating rating={ratingStars} onChange={setRatingStars} readOnly={false} size={28} />
        </div>
        <Textarea
          label="Written Review"
          placeholder="Feedback on kinetic typography, sound design, pacing..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="primary" fullWidth isLoading={submitting} onClick={handleSubmitRating}>
            Submit Review
          </Button>
        </div>
      </Modal>
    </TelegramAppLayout>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { TelegramAppLayout, TELEGRAM_BLUE } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { customFetch } from '../utils/api';
import { useToast } from '@components/ui/Toast';
import {
  triggerHaptic,
  triggerHapticNotification,
  showTelegramConfirm,
} from '../utils/telegramSdk';
import { StarRating } from '@components/ui/StarRating';
import {
  IconCheck,
  IconExternalLink,
  IconShield,
  IconUser,
  IconFileText,
  IconZap,
  IconSliders,
  IconClock,
  IconFilm,
  IconStar,
} from '@icons/icons';

export const TelegramMiniAppPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [unlinked, setUnlinked] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Active Bottom Navigation Tab: 'work' | 'profile'
  const [activeNavTab, setActiveNavTab] = useState('work');

  // Data State
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [targetType, setTargetType] = useState('summary');

  // Account Linking Form State
  const [linkCode, setLinkCode] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionProject, setRevisionProject] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Rating Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingProject, setRatingProject] = useState(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const parseStartParam = (startParam, fetchedProjects, fetchedContracts) => {
    if (!startParam) return;

    if (startParam.startsWith('proposal_') || startParam.startsWith('delivery_')) {
      const projId = startParam.replace('proposal_', '').replace('delivery_', '');
      const foundProj = fetchedProjects.find((p) => p._id === projId);
      if (foundProj) {
        setTargetItem(foundProj);
        setTargetType(startParam.startsWith('delivery_') ? 'delivery' : 'proposal');
      }
    } else if (startParam.startsWith('contract_')) {
      const contractId = startParam.replace('contract_', '');
      const foundContract = fetchedContracts.find((c) => c._id === contractId);
      if (foundContract) {
        setTargetItem(foundContract);
        setTargetType('contract');
      }
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const [projRes, contractRes, meRes] = await Promise.all([
        customFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        customFetch('/api/contracts').catch(() => ({ success: false, contracts: [] })),
        customFetch('/api/auth/me').catch(() => ({ success: false })),
      ]);

      const fetchedProjects = projRes.success ? projRes.projects : [];
      const fetchedContracts = contractRes.success ? contractRes.contracts : [];

      if (meRes.success && meRes.user) {
        setUser(meRes.user);
      }

      setProjects(fetchedProjects);
      setContracts(fetchedContracts);

      const tg = window.Telegram?.WebApp;
      const startParam = tg?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp');
      parseStartParam(startParam, fetchedProjects, fetchedContracts);
    } catch (err) {
      toast({ message: 'Failed to load workspace data', type: 'error' });
    }
  }, [toast]);

  useEffect(() => {
    const authenticateMiniApp = async () => {
      setLoading(true);
      const tg = window.Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready();
          tg.expand();
        } catch (e) {}
      }

      const initData = tg?.initData;
      const startParam = tg?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp');

      // 1. FIRST: Check existing Web JWT session
      try {
        const meRes = await customFetch('/api/auth/me');
        if (meRes.success && meRes.user) {
          setUser(meRes.user);
          setIsAuthenticated(true);
          await fetchDashboardData();

          if (initData) {
            await customFetch('/api/telegram/webapp/auth', {
              method: 'POST',
              body: JSON.stringify({ initData }),
            }).catch(() => {});
          }

          setLoading(false);
          return;
        }
      } catch (err) {
        // Not logged in via existing JWT
      }

      // 2. SECOND: Attempt Telegram WebApp Signature Authentication using initData
      if (initData) {
        try {
          const authRes = await customFetch('/api/telegram/webapp/auth', {
            method: 'POST',
            body: JSON.stringify({ initData }),
          });

          if (authRes.success && authRes.accessToken) {
            localStorage.setItem('token', authRes.accessToken);
            setUser(authRes.user);
            setIsAuthenticated(true);
            await fetchDashboardData();
            setLoading(false);
            return;
          } else if (authRes.unlinked) {
            setTelegramUser(authRes.telegramUser);

            // Auto-submit 6-digit link code if passed in start_param
            if (startParam && (startParam.startsWith('code_') || /^\d{6}$/.test(startParam))) {
              const extractedCode = startParam.replace('code_', '');
              try {
                const linkRes = await customFetch('/api/telegram/webapp/link-code', {
                  method: 'POST',
                  body: JSON.stringify({ code: extractedCode, initData }),
                });

                if (linkRes.success && linkRes.accessToken) {
                  localStorage.setItem('token', linkRes.accessToken);
                  setUser(linkRes.user);
                  setIsAuthenticated(true);
                  await fetchDashboardData();
                  setLoading(false);
                  return;
                }
              } catch (linkErr) {
                // Auto deep-link code match failed
              }
            }
          }
        } catch (err) {
          // Telegram WebApp auth failed
        }
      }

      setUnlinked(true);
      setLoading(false);
    };

    authenticateMiniApp();
  }, [fetchDashboardData]);

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (!linkCode || linkCode.trim().length !== 6) {
      toast({ message: 'Please enter a valid 6-digit code', type: 'error' });
      triggerHapticNotification('error');
      return;
    }

    try {
      setSubmittingLink(true);
      const tg = window.Telegram?.WebApp;
      const initData = tg?.initData;

      const res = await customFetch('/api/telegram/webapp/link-code', {
        method: 'POST',
        body: JSON.stringify({ code: linkCode, initData }),
      });

      if (res.success && res.accessToken) {
        localStorage.setItem('token', res.accessToken);
        setUser(res.user);
        setIsAuthenticated(true);
        setUnlinked(false);
        triggerHapticNotification('success');
        toast({ message: 'Telegram account connected successfully!', type: 'success' });
        await fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to link account', type: 'error' });
    } finally {
      setSubmittingLink(false);
    }
  };

  const handleAcceptProposal = async (projectId) => {
    const confirmed = await showTelegramConfirm('Are you sure you want to accept this proposal?');
    if (!confirmed) return;

    try {
      triggerHaptic('medium');
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Proposal accepted! Project is now in progress.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineProposal = async (projectId) => {
    const confirmed = await showTelegramConfirm('Decline this proposal offer?');
    if (!confirmed) return;

    try {
      triggerHaptic('light');
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/decline`, { method: 'POST' });
      if (res.success) {
        triggerHapticNotification('warning');
        toast({ message: 'Proposal declined.', type: 'info' });
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDelivery = async (projectId) => {
    const confirmed = await showTelegramConfirm('Confirm & approve video delivery?');
    if (!confirmed) return;

    try {
      triggerHaptic('heavy');
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Delivery approved! Please share your rating below.', type: 'success' });
        await fetchDashboardData();

        const approvedProj = projects.find((p) => p._id === projectId) || res.project;
        if (approvedProj) {
          handleOpenRatingModal(approvedProj);
        }
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRatingModal = (project) => {
    triggerHaptic('light');
    setRatingProject(project);
    setRatingStars(5);
    setRatingReview('');
    setShowRatingModal(true);
  };

  const handleSubmitRatingModal = async (e) => {
    e.preventDefault();
    if (!ratingStars) {
      toast({ message: 'Please select a star rating', type: 'error' });
      return;
    }

    try {
      setSubmittingRating(true);
      triggerHaptic('medium');
      const res = await customFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          projectId: ratingProject?._id,
          stars: ratingStars,
          review: ratingReview.trim(),
        }),
      });

      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Thank you! Rating & review published successfully.', type: 'success' });
        setShowRatingModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message || 'Failed to submit rating', type: 'error' });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleOpenRevisionModal = (project) => {
    triggerHaptic('light');
    setRevisionProject(project);
    setRevisionNotes('');
    setShowRevisionModal(true);
  };

  const handleSubmitRevisionRequest = async (e) => {
    e.preventDefault();
    if (!revisionNotes || !revisionNotes.trim()) {
      toast({ message: 'Please enter revision notes for the editors', type: 'error' });
      return;
    }

    try {
      setSubmittingRevision(true);
      triggerHaptic('medium');
      const res = await customFetch(`/api/projects/${revisionProject._id}/revision`, {
        method: 'POST',
        body: JSON.stringify({ revisionNotes }),
      });

      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Revision notes sent to editors on Telegram!', type: 'success' });
        setShowRevisionModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleAcceptContract = async (contractId) => {
    const confirmed = await showTelegramConfirm('Accept monthly retainer terms?');
    if (!confirmed) return;

    try {
      triggerHaptic('medium');
      setSubmitting(true);
      const res = await customFetch(`/api/contracts/${contractId}/accept`, { method: 'POST' });
      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Retainer contract terms accepted!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveDeliverable = async (contractId, deliverableId) => {
    try {
      triggerHaptic('medium');
      setSubmitting(true);
      const res = await customFetch(`/api/contracts/${contractId}/deliverables/${deliverableId}/approve`, { method: 'POST' });
      if (res.success) {
        triggerHapticNotification('success');
        toast({ message: 'Deliverable render approved!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    const confirmed = await showTelegramConfirm('Disconnect Telegram account from this device?');
    if (!confirmed) return;

    try {
      triggerHaptic('warning');
      await customFetch('/api/telegram/unlink', { method: 'POST' });
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUnlinked(true);
      triggerHapticNotification('warning');
      toast({ message: 'Telegram account disconnected.', type: 'info' });
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered' || p.status === 'revision_requested');
  const activeContracts = contracts.filter((c) => c.status === 'proposed' || c.status === 'active');
  const completedProjects = projects.filter((p) => p.status === 'approved' || p.status === 'completed');

  if (loading) {
    return (
      <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Badge variant="gold">Telegram Mini App</Badge>
          <h2 className="font-display" style={{ fontSize: '22px', marginTop: '12px' }}>Loading Workspace...</h2>
        </div>
      </TelegramAppLayout>
    );
  }

  if (unlinked && !isAuthenticated) {
    return (
      <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
        <div style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <Badge variant="gold">Telegram Connection</Badge>
          <h2 className="font-display" style={{ fontSize: '24px', marginTop: '12px', marginBottom: '8px' }}>
            Connect Your Account
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
            {telegramUser?.first_name ? `Welcome, ${telegramUser.first_name}. ` : ''}
            To review video proposals and approve deliverables inside Telegram, enter your 6-digit code from your web dashboard below.
          </p>

          <form onSubmit={handleLinkAccount} style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <Input
              label="Enter 6-Digit Code from Web Dashboard"
              placeholder="e.g. 123456"
              value={linkCode}
              onChange={(e) => setLinkCode(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submittingLink}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: TELEGRAM_BLUE,
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s ease',
              }}
            >
              <IconCheck size={18} />
              <span>{submittingLink ? 'Connecting...' : 'Connect Account'}</span>
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)', fontSize: '13px', color: 'var(--ink-soft)' }}>
            Need your 6-digit connection code?{' '}
            <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer" style={{ color: TELEGRAM_BLUE, fontWeight: 600 }}>
              Open Web Dashboard
            </a>
          </div>
        </div>
      </TelegramAppLayout>
    );
  }

  return (
    <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
      {/* Telegram Native Header Bar */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {(user?.avatarUrl || telegramUser?.photo_url) ? (
            <img
              src={user?.avatarUrl || telegramUser?.photo_url}
              alt={user?.name || 'User'}
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${TELEGRAM_BLUE}` }}
            />
          ) : (
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: TELEGRAM_BLUE, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{user?.role?.toUpperCase()} • Active Workspace</div>
          </div>
        </div>
        <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer">
          <Button variant="secondary" size="small" iconRight={IconExternalLink}>
            Web
          </Button>
        </a>
      </div>

      {/* TAB 1: PROPOSALS & WORK */}
      {activeNavTab === 'work' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* DEEP-LINKED TASK BANNER */}
          {targetItem && (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: `2px solid ${TELEGRAM_BLUE}`, padding: '20px', marginBottom: '8px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: TELEGRAM_BLUE, fontWeight: 600, fontSize: '12px', marginBottom: '6px' }}>
                <IconZap size={16} />
                <span>DEEP-LINKED TASK</span>
              </div>
              <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '8px' }}>
                {targetItem.editingStyle || `${targetItem.packageTier?.toUpperCase()} Retainer`}
              </h3>

              <div style={{ backgroundColor: 'var(--bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', fontSize: '13px', marginBottom: '16px' }}>
                <div><strong>Terms:</strong> {targetItem.price || targetItem.monthlyPrice} {targetItem.currency}</div>
                {targetItem.deadline && <div style={{ marginTop: '4px', color: 'var(--ink-soft)' }}><strong>Deadline:</strong> {new Date(targetItem.deadline).toLocaleDateString()}</div>}
                {targetItem.referenceBrief && <div style={{ marginTop: '6px', color: 'var(--ink-soft)' }}><strong>Brief:</strong> {targetItem.referenceBrief}</div>}
              </div>

              {targetItem.status === 'proposal_sent' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Button variant="secondary" isLoading={submitting} onClick={() => handleDeclineProposal(targetItem._id)}>
                    Decline
                  </Button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleAcceptProposal(targetItem._id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: TELEGRAM_BLUE,
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <IconCheck size={18} />
                    <span>Accept Terms</span>
                  </button>
                </div>
              )}

              {targetItem.status === 'delivered' && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleApproveDelivery(targetItem._id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: TELEGRAM_BLUE,
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <IconCheck size={18} />
                    <span>Confirm & Approve Delivery</span>
                  </button>
                  <Button variant="secondary" fullWidth iconRight={IconSliders} onClick={() => handleOpenRevisionModal(targetItem)}>
                    Request Revisions
                  </Button>
                </div>
              )}

              {targetItem.status === 'proposed' && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleAcceptContract(targetItem._id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: TELEGRAM_BLUE,
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <IconCheck size={18} />
                  <span>Accept Retainer Terms</span>
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
            <IconZap size={20} color={TELEGRAM_BLUE} />
            <h3 className="font-display" style={{ fontSize: '18px', margin: 0 }}>Active Proposals & Projects</h3>
          </div>

          {/* RETAINER CONTRACTS */}
          {activeContracts.map((c) => (
            <div key={c._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px' }}>{c.packageTier?.toUpperCase()} Retainer ({c.frequency})</strong>
                <Badge variant="gold">{c.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: TELEGRAM_BLUE, fontWeight: 600 }}>{c.monthlyPrice} {c.currency} / month</div>

              {c.deliverables && c.deliverables.length > 0 && (
                <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                  {c.deliverables.map((d) => (
                    <div key={d._id} style={{ backgroundColor: 'var(--bg)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconFilm size={14} color="var(--ink-soft)" />
                        <span>#{d.sequenceNumber}: {d.title || `Render #${d.sequenceNumber}`}</span>
                      </span>
                      {d.status === 'delivered' ? (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleApproveDeliverable(c._id, d._id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            backgroundColor: TELEGRAM_BLUE,
                            color: '#FFF',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                      ) : (
                        <Badge variant="success" size="small">APPROVED</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ACTIVE PROJECTS */}
          {activeProjects.map((p) => (
            <div key={p._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px' }}>{p.editingStyle}</strong>
                <Badge variant="gold">{p.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconClock size={14} />
                <span>Terms: {p.price} {p.currency} • Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
              </div>

              {p.status === 'proposal_sent' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <Button variant="secondary" size="small" onClick={() => handleDeclineProposal(p._id)}>Decline</Button>
                  <button
                    type="button"
                    onClick={() => handleAcceptProposal(p._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: TELEGRAM_BLUE,
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconCheck size={16} />
                    <span>Accept</span>
                  </button>
                </div>
              )}

              {p.status === 'delivered' && (
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Button variant="secondary" size="small" iconRight={IconSliders} onClick={() => handleOpenRevisionModal(p)}>Revisions</Button>
                  <button
                    type="button"
                    onClick={() => handleApproveDelivery(p._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: TELEGRAM_BLUE,
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <IconCheck size={16} />
                    <span>Approve</span>
                  </button>
                </div>
              )}

              {(p.status === 'completed' || p.status === 'approved') && !p.rated && (
                <div style={{ marginTop: '12px' }}>
                  <Button variant="secondary" size="small" fullWidth iconRight={IconStar} onClick={() => handleOpenRatingModal(p)}>
                    Rate Experience
                  </Button>
                </div>
              )}

              {p.status === 'revision_requested' && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: TELEGRAM_BLUE, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconSliders size={14} />
                  <span>Revision notes submitted to agency editors. Updates will be sent on Telegram.</span>
                </div>
              )}
            </div>
          ))}

          {activeProjects.length === 0 && activeContracts.length === 0 && (
            <div style={{ backgroundColor: 'var(--surface)', padding: '36px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <IconFileText size={32} color="var(--ink-soft)" style={{ marginBottom: '8px' }} />
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px', margin: 0 }}>No active proposal tasks or ongoing edits right now.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & METRICS */}
      {activeNavTab === 'profile' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
            <IconUser size={20} color={TELEGRAM_BLUE} />
            <h3 className="font-display" style={{ fontSize: '18px', margin: 0 }}>Account & Profile</h3>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {(user?.avatarUrl || telegramUser?.photo_url) ? (
                <img
                  src={user?.avatarUrl || telegramUser?.photo_url}
                  alt={user?.name || 'User'}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${TELEGRAM_BLUE}` }}
                />
              ) : (
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: TELEGRAM_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '22px', color: '#FFF' }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <strong style={{ fontSize: '18px', display: 'block' }}>{user?.name}</strong>
                <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{user?.email}</span>
                <div style={{ marginTop: '4px' }}>
                  <Badge variant="gold">{user?.role?.toUpperCase() || 'CLIENT'}</Badge>
                </div>
              </div>
            </div>

            {/* METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: TELEGRAM_BLUE }}>{activeProjects.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>Active Work</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>{completedProjects.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>Completed</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)' }}>{activeContracts.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '2px' }}>Retainers</div>
              </div>
            </div>

            {/* ACCOUNT CONNECTION DETAILS */}
            <div style={{ backgroundColor: 'var(--bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Telegram Account:</span>
                <strong>{user?.telegramChatId ? `ID #${user.telegramChatId}` : 'Connected'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Connected Since:</span>
                <strong>{user?.telegramLinkedAt ? new Date(user.telegramLinkedAt).toLocaleDateString() : 'Active'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--ink-soft)' }}>Account Status:</span>
                <span style={{ color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconShield size={14} /> Verified Member
                </span>
              </div>
            </div>

            <Button variant="secondary" fullWidth onClick={handleUnlink}>
              Disconnect Telegram Account
            </Button>
          </div>
        </div>
      )}

      {/* REVISION REQUEST MODAL */}
      <Modal isOpen={showRevisionModal} onClose={() => setShowRevisionModal(false)} title="Request Video Revision">
        <form onSubmit={handleSubmitRevisionRequest} style={{ display: 'grid', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Provide specific timestamps and edits you would like updated for <strong>{revisionProject?.editingStyle}</strong>:
          </p>
          <textarea
            rows={4}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="e.g. 0:12 fix subtitle typo, 0:24 change b-roll overlay..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: '13px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              resize: 'vertical',
            }}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setShowRevisionModal(false)}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={submittingRevision}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: TELEGRAM_BLUE,
                color: '#FFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <IconCheck size={16} />
              <span>{submittingRevision ? 'Sending...' : 'Send Notes'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* RATING & REVIEW MODAL */}
      <Modal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Your Experience">
        <form onSubmit={handleSubmitRatingModal} style={{ display: 'grid', gap: '20px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              {ratingProject?.editingStyle || 'Video Delivery'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
              How satisfied are you with this video edit?
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <StarRating rating={ratingStars} onChange={(stars) => { triggerHaptic('light'); setRatingStars(stars); }} readOnly={false} size={32} />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-soft)', marginBottom: '6px' }}>
              Your Feedback (Optional)
            </label>
            <textarea
              rows={3}
              value={ratingReview}
              onChange={(e) => setRatingReview(e.target.value)}
              placeholder="Share your experience working with Alpha Cut..."
              style={{
                width: '100%',
                backgroundColor: 'var(--bg)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setShowRatingModal(false)}>
              Skip
            </Button>
            <button
              type="submit"
              disabled={submittingRating}
              style={{
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: TELEGRAM_BLUE,
                color: '#FFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <IconStar size={16} />
              <span>{submittingRating ? 'Publishing...' : 'Publish Rating'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </TelegramAppLayout>
  );
};

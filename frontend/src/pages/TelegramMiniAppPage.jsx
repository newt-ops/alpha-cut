import React, { useState, useEffect, useCallback } from 'react';
import { TelegramAppLayout } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { customFetch } from '../utils/api';
import { useToast } from '@components/ui/Toast';
import {
  triggerHaptic,
  triggerHapticNotification,
  triggerHapticSelection,
  showTelegramConfirm,
  showTelegramAlert,
} from '../utils/telegramSdk';
import { EDITING_STYLES } from '../data/editingStyles';
import {
  IconCheck,
  IconSparkles,
  IconExternalLink,
  IconShield,
  IconUser,
  IconFileText,
  IconZap,
  IconSliders,
} from '@icons/icons';

export const TelegramMiniAppPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [unlinked, setUnlinked] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Active Bottom Navigation Tab: 'work' | 'packages' | 'styles' | 'account'
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

  // Currency State for Packages Tab
  const [selectedCurrency, setSelectedCurrency] = useState('ETB');

  // Revision Modal State
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionProject, setRevisionProject] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

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
      const [projRes, contractRes] = await Promise.all([
        customFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        customFetch('/api/contracts').catch(() => ({ success: false, contracts: [] })),
      ]);

      const fetchedProjects = projRes.success ? projRes.projects : [];
      const fetchedContracts = contractRes.success ? contractRes.contracts : [];

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

            // Auto-submit 6-digit link code if passed in start_param (e.g. startapp=code_123456 or 123456)
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
        toast({ message: 'Delivery approved!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      triggerHapticNotification('error');
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Badge variant="gold">Mini App Launch</Badge>
          <h2 className="font-display" style={{ fontSize: '22px', marginTop: '12px' }}>Loading Workspace...</h2>
        </div>
      </TelegramAppLayout>
    );
  }

  if (unlinked && !isAuthenticated) {
    return (
      <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
        <div style={{ textAlign: 'center', padding: '32px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <Badge variant="gold">Telegram Integration</Badge>
          <h2 className="font-display" style={{ fontSize: '24px', marginTop: '12px', marginBottom: '8px' }}>
            Connect Your Account
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
            {telegramUser?.first_name ? `Welcome, ${telegramUser.first_name}. ` : ''}
            To access your video proposals and approve deliverables inside Telegram, enter your 6-digit code from your web dashboard below.
          </p>

          <form onSubmit={handleLinkAccount} style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <Input
              label="Enter 6-Digit Code from Web Dashboard"
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
            Need your 6-digit connection code?{' '}
            <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
              Open Web Dashboard
            </a>
          </div>
        </div>
      </TelegramAppLayout>
    );
  }

  return (
    <TelegramAppLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
      {/* Header Banner */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Badge variant="gold">Action Console</Badge>
          <h2 className="font-display" style={{ fontSize: '22px', marginTop: '4px' }}>{user?.name}</h2>
        </div>
        <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer">
          <Button variant="secondary" size="small" iconRight={IconExternalLink}>
            Web
          </Button>
        </a>
      </div>

      {/* TAB 1: WORK & PROPOSALS */}
      {activeNavTab === 'work' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* TARGET SPECIFIC DEEP-LINK ACTION PANEL */}
          {targetItem && (
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-gold)', padding: '20px', marginBottom: '8px', boxShadow: 'var(--shadow)' }}>
              <Badge variant="gold">DEEP-LINKED TASK</Badge>
              <h3 className="font-display" style={{ fontSize: '20px', marginTop: '6px', marginBottom: '8px' }}>
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
                  <Button variant="primary" iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptProposal(targetItem._id)}>
                    Accept Terms
                  </Button>
                </div>
              )}

              {targetItem.status === 'delivered' && (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleApproveDelivery(targetItem._id)}>
                    Confirm & Approve Delivery
                  </Button>
                  <Button variant="secondary" fullWidth iconRight={IconSliders} onClick={() => handleOpenRevisionModal(targetItem)}>
                    Request Revisions
                  </Button>
                </div>
              )}

              {targetItem.status === 'proposed' && (
                <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptContract(targetItem._id)}>
                  Accept Retainer Terms
                </Button>
              )}
            </div>
          )}

          <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Active Work & Proposals</h3>

          {/* RETAINER CONTRACTS */}
          {activeContracts.map((c) => (
            <div key={c._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px' }}>{c.packageTier?.toUpperCase()} Retainer ({c.frequency})</strong>
                <Badge variant="gold">{c.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 600 }}>{c.monthlyPrice} {c.currency} / month</div>

              {c.deliverables && c.deliverables.length > 0 && (
                <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                  {c.deliverables.map((d) => (
                    <div key={d._id} style={{ backgroundColor: 'var(--bg)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span>#{d.sequenceNumber}: {d.title || `Render #${d.sequenceNumber}`}</span>
                      {d.status === 'delivered' ? (
                        <Button variant="primary" size="small" isLoading={submitting} onClick={() => handleApproveDeliverable(c._id, d._id)}>
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
          ))}

          {/* ACTIVE PROJECTS */}
          {activeProjects.map((p) => (
            <div key={p._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '15px' }}>{p.editingStyle}</strong>
                <Badge variant="gold">{p.status.toUpperCase()}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                Terms: {p.price} {p.currency} • Deadline: {new Date(p.deadline).toLocaleDateString()}
              </div>

              {p.status === 'proposal_sent' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <Button variant="secondary" size="small" onClick={() => handleDeclineProposal(p._id)}>Decline</Button>
                  <Button variant="primary" size="small" iconRight={IconCheck} onClick={() => handleAcceptProposal(p._id)}>Accept</Button>
                </div>
              )}

              {p.status === 'delivered' && (
                <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Button variant="secondary" size="small" iconRight={IconSliders} onClick={() => handleOpenRevisionModal(p)}>Revisions</Button>
                  <Button variant="primary" size="small" iconRight={IconCheck} onClick={() => handleApproveDelivery(p._id)}>Approve</Button>
                </div>
              )}

              {p.status === 'revision_requested' && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                  Revision notes submitted to editors. Updates will be sent on Telegram.
                </div>
              )}
            </div>
          ))}

          {activeProjects.length === 0 && activeContracts.length === 0 && (
            <div style={{ backgroundColor: 'var(--surface)', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>No active proposal tasks or ongoing edits.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PACKAGES & RATES */}
      {activeNavTab === 'packages' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Package Rate Cards</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                variant={selectedCurrency === 'ETB' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => { triggerHaptic('light'); setSelectedCurrency('ETB'); }}
              >
                ETB (Br)
              </Button>
              <Button
                variant={selectedCurrency === 'USD' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => { triggerHaptic('light'); setSelectedCurrency('USD'); }}
              >
                USD ($)
              </Button>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '16px' }}>Basic Edit Tier</strong>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{selectedCurrency === 'ETB' ? '500 – 800 ETB' : '$10 – $15 USD'} / video</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Clean subtitles, standard pacing, basic audio polish, 1 revision. Ideal for quick social clips.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-gold)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '16px' }}>Professional Tier ⭐ (Recommended)</strong>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{selectedCurrency === 'ETB' ? '1,000 – 1,500 ETB' : '$20 – $30 USD'} / video</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Kinetic typography, dynamic b-roll overlays, custom sound effects, 2 revisions.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '16px' }}>Premium Edit Tier 💎</strong>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{selectedCurrency === 'ETB' ? '1,600 – 2,400 ETB' : '$35 – $50 USD'} / video</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Custom 2D/3D motion graphics, advanced visual breakdowns, sound design mix, 3 revisions.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: SIGNATURE EDITING STYLES */}
      {activeNavTab === 'styles' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Signature Editing Styles</h3>
          {EDITING_STYLES.map((style) => (
            <div key={style.id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '16px' }}>{style.name}</strong>
                <Badge variant="gold">{style.format || '9:16 Shorts'}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: 600 }}>
                Pacing: {style.pacing || 'Kinetic / Fast'}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, margin: 0 }}>
                {style.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: ACCOUNT & PROFILE */}
      {activeNavTab === 'account' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Account Settings</h3>
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', color: '#000' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <strong style={{ fontSize: '16px', display: 'block' }}>{user?.name}</strong>
                <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{user?.email}</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', fontSize: '13px', marginBottom: '20px' }}>
              <div><strong>Role:</strong> {user?.role?.toUpperCase()}</div>
              <div style={{ marginTop: '4px' }}><strong>Status:</strong> <span style={{ color: '#4ade80' }}>Connected to Telegram</span></div>
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
            <Button type="submit" variant="primary" isLoading={submittingRevision} iconRight={IconCheck}>
              Send Notes
            </Button>
          </div>
        </form>
      </Modal>
    </TelegramAppLayout>
  );
};

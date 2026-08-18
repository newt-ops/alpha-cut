import React, { useState, useEffect, useCallback } from 'react';
import { TelegramAppLayout } from '@components/layout/TelegramAppLayout';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Stepper } from '@components/ui/Stepper';
import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { customFetch } from '../utils/api';
import { useToast } from '@components/ui/Toast';
import {
  IconCheck,
  IconSparkles,
  IconExternalLink,
  IconShield,
  IconUser,
  IconFileText,
} from '@icons/icons';

export const TelegramMiniAppPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [unlinked, setUnlinked] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

  // Data State
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [targetType, setTargetType] = useState('summary');

  // Account Linking Form State
  const [linkCode, setLinkCode] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {}
    }

    const authenticateMiniApp = async () => {
      setLoading(true);
      const initData = tg?.initData;
      const startParam = tg?.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp');

      // 1. FIRST: Check existing Web JWT session (if already logged in on web platform)
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
                // Auto deep-link code match failed, fall through to manual form
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
    if (!linkCode || linkCode.trim().length !== 6) {
      toast({ message: 'Please enter a valid 6-digit code', type: 'error' });
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
        toast({ message: 'Telegram account connected successfully!', type: 'success' });
        await fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to link account', type: 'error' });
    } finally {
      setSubmittingLink(false);
    }
  };

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

  const handleDeclineProposal = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await customFetch(`/api/projects/${projectId}/decline`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal declined.', type: 'info' });
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
        toast({ message: 'Delivery approved!', type: 'success' });
        fetchDashboardData();
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
        toast({ message: 'Retainer contract terms accepted!', type: 'success' });
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
        toast({ message: 'Deliverable video approved!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeProjects = projects.filter((p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered');
  const activeContracts = contracts.filter((c) => c.status === 'proposed' || c.status === 'active');

  if (loading) {
    return (
      <TelegramAppLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Badge variant="gold">Mini App Launch</Badge>
          <h2 className="font-display" style={{ fontSize: '22px', marginTop: '12px' }}>Loading Workspace...</h2>
        </div>
      </TelegramAppLayout>
    );
  }

  if (unlinked && !isAuthenticated) {
    return (
      <TelegramAppLayout>
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
    <TelegramAppLayout>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Badge variant="gold">Action Console</Badge>
          <h2 className="font-display" style={{ fontSize: '22px', marginTop: '4px' }}>{user?.name}</h2>
        </div>
        <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer">
          <Button variant="secondary" size="small" iconRight={IconExternalLink}>
            Full Dashboard
          </Button>
        </a>
      </div>

      {/* TARGET SPECIFIC DEEP-LINK ACTION PANEL */}
      {targetItem && (
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-gold)', padding: '20px', marginBottom: '24px', boxShadow: 'var(--shadow)' }}>
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
            <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleApproveDelivery(targetItem._id)}>
              Confirm & Approve Delivery
            </Button>
          )}

          {targetItem.status === 'proposed' && (
            <Button variant="primary" fullWidth iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptContract(targetItem._id)}>
              Accept Retainer Terms
            </Button>
          )}
        </div>
      )}

      {/* SUMMARY READ-ONLY ACTIVE WORK SNAPSHOT */}
      <div style={{ display: 'grid', gap: '16px' }}>
        <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)' }}>Active Work Snapshot</h3>

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
              <div style={{ marginTop: '12px' }}>
                <Button variant="primary" size="small" fullWidth iconRight={IconCheck} onClick={() => handleApproveDelivery(p._id)}>Confirm Delivery</Button>
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

      {/* External Full Dashboard Redirection Footer */}
      <div style={{ marginTop: '28px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
        <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
          For full history, pricing calculators, profile settings, and review submission:
        </p>
        <a href="https://alpha-cut-nine.vercel.app/dashboard" target="_blank" rel="noreferrer">
          <Button variant="secondary" size="small" iconRight={IconExternalLink}>
            Open Alpha Cut Web Platform
          </Button>
        </a>
      </div>
    </TelegramAppLayout>
  );
};

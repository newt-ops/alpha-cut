import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Stepper } from '@components/ui/Stepper';
import { Modal } from '@components/ui/Modal';
import { StarRating } from '@components/ui/StarRating';
import { Textarea, Input } from '@components/ui/Input';
import { Tabs } from '@components/ui/Tabs';
import { Dropzone } from '@components/ui/Dropzone';
import { NotionCalendar } from '@components/calendar/NotionCalendar';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { Skeleton } from '@components/ui/Skeleton';
import {
  IconCheck,
  IconSparkles,
  IconExternalLink,
  IconZap,
  IconShield,
  IconUser,
  IconCalendar,
  IconChevronRight,
  IconFileText,
} from '@icons/icons';

export const DashboardPage = () => {
  const { user, apiFetch, unlinkTelegram, updateProfile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded Contained Cards Tracking State
  const [expandedProjectIds, setExpandedProjectIds] = useState({});

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Telegram Unlinking State
  const [unlinkingTelegram, setUnlinkingTelegram] = useState(false);

  // Modals & Action State
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [contractRateModalOpen, setContractRateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Chapa Payment Test Mode State
  const [chapaEnabled, setChapaEnabled] = useState(false);
  const [payingChapaId, setPayingChapaId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, contractRes, notifRes, ratRes, chapaRes] = await Promise.all([
        apiFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        apiFetch('/api/contracts').catch(() => ({ success: false, contracts: [] })),
        apiFetch('/api/notifications').catch(() => ({ success: false, notifications: [] })),
        apiFetch('/api/ratings').catch(() => ({ success: false, ratings: [] })),
        apiFetch('/api/payments/chapa/status').catch(() => ({ success: false })),
      ]);

      if (projRes.success) setProjects(projRes.projects);
      if (contractRes.success) setContracts(contractRes.contracts);
      if (notifRes.success) setNotifications(notifRes.notifications);
      if (ratRes.success) setRatings(ratRes.ratings);
      if (chapaRes.success) setChapaEnabled(chapaRes.enabled);
    } catch (err) {
      toast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePayWithChapa = async (itemType, itemId) => {
    try {
      setPayingChapaId(itemId);
      const res = await apiFetch('/api/payments/chapa/initialize', {
        method: 'POST',
        body: JSON.stringify({ itemType, itemId }),
      });

      if (res.success && res.checkoutUrl) {
        toast({ message: 'Redirecting to Chapa Payment Gateway (Test Mode)...', type: 'info' });
        window.location.href = res.checkoutUrl;
      }
    } catch (err) {
      toast({ message: err.message || 'Failed to initialize Chapa payment', type: 'error' });
    } finally {
      setPayingChapaId(null);
    }
  };

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const toggleExpandProject = (id) => {
    setExpandedProjectIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeProjects = projects.filter(
    (p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered'
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
    { label: 'Proposal Sent', desc: 'Awaiting your review' },
    { label: 'In Progress', desc: 'Editing & Motion Polish' },
    { label: 'Work Delivered', desc: 'Review Render' },
    { label: 'Approved & Completed', desc: 'Final Export' },
  ];

  // Accept Project Proposal
  const handleAcceptProposal = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal accepted! Project is officially in progress.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Decline Project Proposal
  const handleDeclineProposal = async () => {
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${selectedProject._id}/decline`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal declined.', type: 'info' });
        setDeclineModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Project Delivery
  const handleApproveDelivery = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
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

  // Accept Retainer Contract
  const handleAcceptContract = async (contractId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract accepted! Deliverables tracking is active.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Decline Retainer Contract
  const handleDeclineContract = async (contractId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/decline`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract proposal declined.', type: 'info' });
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Retainer Deliverable Video
  const handleApproveDeliverable = async (contractId, deliverableId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/deliverables/${deliverableId}/approve`, { method: 'POST' });
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

  // Submit Rating for Project
  const handleSubmitRating = async () => {
    if (!selectedProject || !reviewText) {
      toast({ message: 'Please write a review before submitting.', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify({
          subjectType: 'project',
          subjectId: selectedProject._id,
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

  // Submit Rating for Retainer Contract
  const handleSubmitContractRating = async () => {
    if (!selectedContract || !reviewText) {
      toast({ message: 'Please write a review before submitting.', type: 'error' });
      return;
    }
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${selectedContract._id}/rating`, {
        method: 'POST',
        body: JSON.stringify({
          stars: ratingStars,
          review: reviewText,
        }),
      });

      if (res.success) {
        toast({ message: 'Thank you for rating your retainer engagement!', type: 'success' });
        setContractRateModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true);
      const sigRes = await apiFetch('/api/uploads/signature', { method: 'POST' });
      if (!sigRes.success) throw new Error('Failed to obtain upload signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigRes.apiKey);
      formData.append('timestamp', sigRes.timestamp);
      formData.append('signature', sigRes.signature);
      formData.append('folder', sigRes.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setAvatarUrl(cloudData.secure_url);
        await updateProfile({ avatarUrl: cloudData.secure_url });
        toast({ message: 'Profile photo updated!', type: 'success' });
      }
    } catch (err) {
      toast({ message: err.message || 'Avatar upload failed', type: 'error' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateProfile({
        name: profileName,
        avatarUrl,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        toast({ message: 'Profile updated successfully!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUnlinkTelegram = async () => {
    try {
      setUnlinkingTelegram(true);
      await unlinkTelegram();
      toast({ message: 'Telegram account disconnected! You can now link to another account.', type: 'info' });
    } catch (err) {
      toast({ message: err.message || 'Failed to disconnect Telegram', type: 'error' });
    } finally {
      setUnlinkingTelegram(false);
    }
  };

  const dashboardTabs = [
    { id: 'overview', label: 'Active Overview' },
    { id: 'contracts', label: 'My Retainer Contracts' },
    { id: 'calendar', label: 'Schedule & Deadlines' },
    { id: 'projects', label: 'My Projects' },
    { id: 'profile', label: 'Account Profile' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px 0', maxWidth: '900px', margin: '0 auto' }}>
        <Skeleton height="50px" style={{ marginBottom: '24px' }} />
        <Skeleton height="240px" />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user?.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(201, 160, 107, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 800,
                fontSize: '22px',
                border: '2px solid var(--accent-gold)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}

          <div>
            <Badge variant="gold">Client Workspace</Badge>
            <h1 className="font-display" style={{ fontSize: '32px', marginTop: '4px' }}>
              Welcome, {user?.name}
            </h1>
          </div>
        </div>
        <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* OVERVIEW TAB — Contained Cards with Expandable Details */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Active Retainer Contracts Section */}
          {contracts.filter((c) => c.status === 'proposed' || c.status === 'active').length > 0 && (
            <div>
              <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--ink)' }}>
                Active Retainer Contracts ({contracts.filter((c) => c.status === 'proposed' || c.status === 'active').length})
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '20px' }}>
                Your ongoing monthly retainer engagements and handed-over deliverables.
              </p>

              <div style={{ display: 'grid', gap: '20px' }}>
                {contracts.filter((c) => c.status === 'proposed' || c.status === 'active').map((contract) => {
                  const delCount = contract.deliveredCount || 0;
                  const planned = contract.totalVideosPlanned || 8;
                  const pct = Math.min(100, Math.round((delCount / planned) * 100));

                  return (
                    <div
                      key={contract._id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--line)',
                        padding: '24px 28px',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <Badge variant={contract.status === 'active' ? 'success' : 'gold'}>
                            RETAINER • {contract.status.toUpperCase()}
                          </Badge>
                          <h3 className="font-display" style={{ fontSize: '20px', marginTop: '6px' }}>
                            {contract.packageTier?.toUpperCase()} Retainer ({contract.frequency})
                          </h3>
                          <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                            {contract.monthlyPrice} {contract.currency} / month
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          {contract.status === 'proposed' && (
                            <>
                              <Button
                                variant="secondary"
                                size="small"
                                isLoading={submitting}
                                onClick={() => handleDeclineContract(contract._id)}
                              >
                                Decline
                              </Button>

                              <Button
                                variant="primary"
                                size="small"
                                iconRight={IconCheck}
                                isLoading={submitting}
                                onClick={() => handleAcceptContract(contract._id)}
                              >
                                Accept Retainer Terms
                              </Button>
                            </>
                          )}

                          {chapaEnabled && (contract.status === 'proposed' || contract.status === 'active') && (
                            <Button
                              variant="gold"
                              size="small"
                              isLoading={payingChapaId === contract._id}
                              onClick={() => handlePayWithChapa('contract', contract._id)}
                            >
                              Pay with Chapa (ETB)
                            </Button>
                          )}

                          {contract.status === 'active' && (
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => setActiveTab('contracts')}
                            >
                              Manage Deliverables ({delCount}/{planned})
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                          <span>Deliverables Handed Over: {delCount} of {planned} Videos</span>
                          <span className="font-mono">{pct}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--ink)' }}>
              Active Proposals & Projects ({activeProjects.length})
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px' }}>
              Compact proposal cards. Click any card to expand full milestone stepper and details.
            </p>

            {activeProjects.length === 0 ? (
              <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>You currently have no active proposals or ongoing video projects.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {activeProjects.map((proj) => {
                  const isExpanded = !!expandedProjectIds[proj._id];

                  return (
                    <div
                      key={proj._id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--line)',
                        boxShadow: 'var(--shadow-sm)',
                        overflow: 'hidden',
                        transition: 'border-color var(--transition-fast)',
                      }}
                    >
                      {/* COMPACT CONTAINED CARD HEADER */}
                      <div
                        style={{
                          padding: '24px 28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '16px',
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? 'var(--bg)' : 'transparent',
                          borderBottom: isExpanded ? '1px solid var(--line)' : 'none',
                        }}
                        onClick={() => toggleExpandProject(proj._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: 'rgba(201, 160, 107, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--accent-gold)',
                              fontWeight: 800,
                              fontSize: '18px',
                            }}
                          >
                            🎬
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <h3 className="font-display" style={{ fontSize: '20px', color: 'var(--ink)' }}>{proj.editingStyle}</h3>
                              <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>
                                {proj.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                              Terms: <strong>{proj.price} {proj.currency}</strong> ({proj.packageTier?.toUpperCase()}) • Deadline: {new Date(proj.deadline).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={(e) => e.stopPropagation()}>
                          {proj.status === 'proposal_sent' && (
                            <Button
                              variant="primary"
                              size="small"
                              iconRight={IconCheck}
                              isLoading={submitting}
                              onClick={() => handleAcceptProposal(proj._id)}
                            >
                              Accept Proposal
                            </Button>
                          )}

                          {chapaEnabled && (proj.status === 'proposal_sent' || proj.status === 'in_progress' || proj.status === 'delivered') && (
                            <Button
                              variant="gold"
                              size="small"
                              isLoading={payingChapaId === proj._id}
                              onClick={() => handlePayWithChapa('project', proj._id)}
                            >
                              Pay with Chapa (ETB)
                            </Button>
                          )}

                          {proj.status === 'delivered' && (
                            <Button
                              variant="primary"
                              size="small"
                              iconRight={IconSparkles}
                              isLoading={submitting}
                              onClick={() => handleApproveDelivery(proj._id)}
                            >
                              Approve Delivery
                            </Button>
                          )}

                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => toggleExpandProject(proj._id)}
                          >
                            {isExpanded ? 'Collapse Details ↑' : 'Reveal Stepper & Details ↓'}
                          </Button>
                        </div>
                      </div>

                      {/* EXPANDED REVEALED SPECIFICATIONS & STEPPER */}
                      {isExpanded && (
                        <div style={{ padding: '28px', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
                          <div style={{ marginBottom: '28px' }}>
                            <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
                          </div>

                          <div style={{ backgroundColor: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', fontSize: '13px', marginBottom: '20px' }}>
                            <div><strong>Reference Brief / Notes:</strong></div>
                            <p style={{ marginTop: '4px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                              {proj.referenceBrief || 'No specific brief notes attached to this proposal.'}
                            </p>
                          </div>

                          {proj.status === 'proposal_sent' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  setSelectedProject(proj);
                                  setDeclineModalOpen(true);
                                }}
                              >
                                Decline Proposal
                              </Button>
                              <Button
                                variant="primary"
                                iconRight={IconCheck}
                                isLoading={submitting}
                                onClick={() => handleAcceptProposal(proj._id)}
                              >
                                Accept Proposal Terms
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY RETAINER CONTRACTS TAB */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>My Retainer Contracts ({contracts.length})</h2>
          {contracts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No active or proposed retainer contracts found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              {contracts.map((contract) => {
                const delCount = contract.deliveredCount || 0;
                const planned = contract.totalVideosPlanned || 8;
                const pct = Math.min(100, Math.round((delCount / planned) * 100));

                return (
                  <div
                    key={contract._id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${contract.status === 'active' ? 'var(--accent-gold)' : 'var(--line)'}`,
                      padding: '28px',
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <Badge variant={contract.status === 'active' ? 'gold' : contract.status === 'completed' ? 'success' : 'surface'}>
                          {contract.status.toUpperCase()} RETAINER
                        </Badge>
                        <h3 className="font-display" style={{ fontSize: '22px', marginTop: '6px' }}>
                          {contract.packageTier?.toUpperCase()} Tier — {contract.frequency}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--accent-gold)', marginTop: '2px', fontWeight: 700 }}>
                          {contract.monthlyPrice} {contract.currency} / month ({planned} planned videos)
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {contract.status === 'proposed' && (
                          <>
                            <Button variant="secondary" onClick={() => handleDeclineContract(contract._id)}>
                              Decline
                            </Button>
                            <Button variant="primary" iconRight={IconCheck} isLoading={submitting} onClick={() => handleAcceptContract(contract._id)}>
                              Accept Retainer Terms
                            </Button>
                          </>
                        )}

                        {contract.status === 'completed' && !contract.rated && (
                          <Button
                            variant="primary"
                            iconRight={IconSparkles}
                            onClick={() => {
                              setSelectedContract(contract);
                              setContractRateModalOpen(true);
                            }}
                          >
                            Submit Retainer Review
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                        <span>Deliverables Handed Over: {delCount} of {planned} Videos</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>

                    {/* Individual Deliverables List */}
                    {contract.deliverables && contract.deliverables.length > 0 && (
                      <div style={{ backgroundColor: 'var(--bg)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                        <h4 className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '12px' }}>DELIVERED VIDEO RENDERS:</h4>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {contract.deliverables.map((d) => (
                            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                              <div>
                                <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>#{d.sequenceNumber}: {d.title || `Video Render #${d.sequenceNumber}`}</strong>
                                {d.deliverableUrl && (
                                  <a href={d.deliverableUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '12px', color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 600 }}>
                                    Watch Video Render ↗
                                  </a>
                                )}
                              </div>

                              {d.status === 'delivered' ? (
                                <Button
                                  variant="primary"
                                  size="small"
                                  iconRight={IconCheck}
                                  isLoading={submitting}
                                  onClick={() => handleApproveDeliverable(contract._id, d._id)}
                                >
                                  Approve Video
                                </Button>
                              ) : (
                                <Badge variant="success" size="small">APPROVED</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NOTION CALENDAR SCHEDULE TAB */}
      {activeTab === 'calendar' && (
        <NotionCalendar
          projects={projects}
          contracts={contracts}
          onSelectProject={(proj) => {
            setSelectedProject(proj);
            setExpandedProjectIds((prev) => ({ ...prev, [proj._id]: true }));
            setActiveTab('overview');
          }}
        />
      )}

      {/* MY PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>Project History ({projects.length})</h2>
          {projects.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No project history records found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {projects.map((proj) => (
                <div key={proj._id} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{new Date(proj.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '6px' }}>{proj.editingStyle}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 700 }}>{proj.price} {proj.currency}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '36px 30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', boxShadow: 'var(--shadow)' }}>
          <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--ink)' }}>Account Profile & Telegram Settings</h2>

          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
                Profile Avatar Photo (Cloudinary Direct Upload)
              </label>
              <Dropzone
                onFileSelect={handleAvatarUpload}
                isLoading={uploadingAvatar}
                accept="image/*"
                label="Drag & drop new avatar photo here..."
              />
            </div>

            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
            />

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px', marginTop: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Telegram Integration Status</h3>
              {user?.telegramChatId ? (
                <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Badge variant="success" size="small">CONNECTED</Badge>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Linked Chat ID: {user.telegramChatId}</p>
                  </div>
                  <Button variant="secondary" size="small" isLoading={unlinkingTelegram} onClick={handleUnlinkTelegram}>
                    Disconnect Telegram
                  </Button>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>Telegram bot notifications not connected.</span>
                  <a href="/telegram-link">
                    <Button variant="primary" size="small">Connect Telegram</Button>
                  </a>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Change Password</h3>
              <Input
                label="Current Password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '12px' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={savingProfile} iconRight={IconCheck}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Decline Proposal Confirmation Modal */}
      <Modal isOpen={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Project Proposal">
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Are you sure you want to decline the proposal for <strong>{selectedProject?.editingStyle}</strong> ({selectedProject?.price} {selectedProject?.currency})?
        </p>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setDeclineModalOpen(false)}>Keep Proposal</Button>
          <Button variant="primary" isLoading={submitting} onClick={handleDeclineProposal} style={{ backgroundColor: '#E53E3E', borderColor: '#E53E3E' }}>
            Confirm Decline
          </Button>
        </div>
      </Modal>

      {/* Project Rating Modal */}
      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Rate Delivered Video Edit">
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <StarRating rating={ratingStars} onChange={setRatingStars} readOnly={false} size={28} />
        </div>
        <Textarea
          label="Written Feedback & Review"
          placeholder="Share your experience working with Alpha Cut..."
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

      {/* Retainer Contract Rating Modal */}
      <Modal isOpen={contractRateModalOpen} onClose={() => setContractRateModalOpen(false)} title="Rate Retainer Contract Engagement">
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <StarRating rating={ratingStars} onChange={setRatingStars} readOnly={false} size={28} />
        </div>
        <Textarea
          label="Written Retainer Feedback & Review"
          placeholder="Feedback on monthly retainer delivery quality and consistency..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="primary" fullWidth isLoading={submitting} onClick={handleSubmitContractRating}>
            Submit Retainer Review
          </Button>
        </div>
      </Modal>
    </div>
  );
};

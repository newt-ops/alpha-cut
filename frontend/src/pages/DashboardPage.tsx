import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
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
  IconFilm,
} from '@icons/icons';

export const DashboardPage: React.FC = () => {
  const { user, apiFetch, unlinkTelegram, updateProfile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded Contained Cards Tracking State
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  // Telegram Unlinking State
  const [unlinkingTelegram, setUnlinkingTelegram] = useState(false);

  // Modals & Action State
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [contractRateModalOpen, setContractRateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, contractRes, notifRes, ratRes] = await Promise.all([
        apiFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        apiFetch('/api/contracts').catch(() => ({ success: false, contracts: [] })),
        apiFetch('/api/notifications').catch(() => ({ success: false, notifications: [] })),
        apiFetch('/api/ratings').catch(() => ({ success: false, ratings: [] })),
      ]);

      if (projRes.success) setProjects(projRes.projects);
      if (contractRes.success) setContracts(contractRes.contracts);
      if (notifRes.success) setNotifications(notifRes.notifications);
      if (ratRes.success) setRatings(ratRes.ratings);
    } catch (err) {
      toast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const toggleExpandProject = (id: string) => {
    setExpandedProjectIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeProjects = projects.filter(
    (p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered'
  );

  const getStepIndex = (status: string) => {
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
  const handleAcceptProposal = async (projectId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal accepted! Project is officially in progress.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err: any) {
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
    } catch (err: any) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Project Delivery
  const handleApproveDelivery = async (projectId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Delivery approved! Rating unlocked.', type: 'success' });
        fetchDashboardData();
        setSelectedProject(res.project);
        setRateModalOpen(true);
      }
    } catch (err: any) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Request Video Revision
  const handleRequestRevision = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !revisionNotes.trim()) {
      toast({ message: 'Please enter revision notes.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${selectedProject._id}/revision`, {
        method: 'POST',
        body: JSON.stringify({ revisionNotes: revisionNotes.trim() }),
      });
      if (res.success) {
        toast({ message: 'Revision request sent to Alpha Cut team!', type: 'success' });
        setRevisionModalOpen(false);
        setRevisionNotes('');
        fetchDashboardData();
      }
    } catch (err: any) {
      toast({ message: err.message || 'Failed to request revision', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Accept Retainer Contract
  const handleAcceptContract = async (contractId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract accepted! Deliverables tracking is active.', type: 'success' });
        fetchDashboardData();
      }
    } catch (err: any) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Decline Retainer Contract
  const handleDeclineContract = async (contractId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/decline`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Retainer contract proposal declined.', type: 'info' });
        fetchDashboardData();
      }
    } catch (err: any) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Approve Retainer Deliverable Video
  const handleApproveDeliverable = async (contractId: string, deliverableId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contractId}/deliverables/${deliverableId}/approve`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Video deliverable approved!', type: 'success' });
        fetchDashboardData();
      }
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      setAvatarProgress(0);
      const sigRes = await apiFetch('/api/uploads/signature', { method: 'POST' });
      if (!sigRes.success) throw new Error('Failed to obtain upload signature');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigRes.apiKey);
      formData.append('timestamp', sigRes.timestamp);
      formData.append('signature', sigRes.signature);
      formData.append('folder', sigRes.folder);

      const cloudData: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sigRes.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setAvatarProgress(percent);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed with status ' + xhr.status));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during avatar upload'));
        xhr.send(formData);
      });

      if (cloudData.secure_url) {
        setAvatarUrl(cloudData.secure_url);
        await updateProfile({ avatarUrl: cloudData.secure_url });
        toast({ message: 'Profile photo updated!', type: 'success' });
      }
    } catch (err: any) {
      toast({ message: err.message || 'Avatar upload failed', type: 'error' });
    } finally {
      setUploadingAvatar(false);
      setAvatarProgress(0);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await updateProfile({
        name: profileName,
        avatarUrl,
        ...(oldPassword ? { oldPassword } : {}),
        ...(newPassword ? { newPassword } : {}),
      } as any);

      if (res.success) {
        toast({ message: 'Profile updated successfully!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
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
    } catch (err: any) {
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
              <h1 className="font-display" style={{ fontSize: 'clamp(22px, 5vw, 32px)', marginTop: '4px', color: 'var(--ink)', fontWeight: 800 }}>
                Welcome, {user?.name}
              </h1>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
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
                          padding: '20px 16px',
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
                          <Badge variant={proj.status === 'proposal_sent' ? 'gold' : proj.status === 'delivered' ? 'maroon' : 'surface'}>
                            {proj.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <div>
                            <h3 className="font-display" style={{ fontSize: '18px', color: 'var(--ink)', margin: 0 }}>
                              {proj.editingStyle}
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                              {proj.price} {proj.currency}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {proj.status === 'proposal_sent' && (
                            <Button
                              variant="primary"
                              size="small"
                              iconRight={IconCheck}
                              isLoading={submitting}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptProposal(proj._id);
                              }}
                            >
                              Accept Proposal
                            </Button>
                          )}

                          {proj.status === 'delivered' && (
                            <Button
                              variant="primary"
                              size="small"
                              iconRight={IconCheck}
                              isLoading={submitting}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveDelivery(proj._id);
                              }}
                            >
                              Approve Delivery
                            </Button>
                          )}

                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                            {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDABLE BODY CONTENT */}
                      {isExpanded && (
                        <div style={{ padding: '24px 28px', display: 'grid', gap: '24px' }}>
                          {/* Milestone Stepper */}
                          <div style={{ padding: '16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
                          </div>

                          {/* Proposal Video Specs & Notes */}
                          {proj.videoNotes && (
                            <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>
                                PROPOSAL SCOPE & VIDEO NOTES:
                              </span>
                              <p style={{ fontSize: '13px', color: 'var(--ink)', margin: 0, lineHeight: 1.5 }}>
                                {proj.videoNotes}
                              </p>
                            </div>
                          )}

                          {/* Delivery Link Display */}
                          {proj.deliveryLink && (
                            <div style={{ padding: '16px', backgroundColor: 'rgba(201, 160, 107, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>
                                  DELIVERED VIDEO RENDER:
                                </span>
                                <a href={proj.deliveryLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', textDecoration: 'underline' }}>
                                  {proj.deliveryLink}
                                </a>
                              </div>
                              <a href={proj.deliveryLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary" size="small" iconRight={IconExternalLink}>Open Render</Button>
                              </a>
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

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <NotionCalendar projects={projects} contracts={contracts} />
      )}

      {/* RETAINER CONTRACTS TAB */}
      {activeTab === 'contracts' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>
            My Retainer Engagements
          </h2>
          {contracts.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)' }}>You have no monthly retainer contracts on record.</p>
            </div>
          ) : (
            contracts.map((c) => (
              <div key={c._id} style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <Badge variant={c.status === 'active' ? 'success' : 'gold'}>{c.status.toUpperCase()}</Badge>
                    <h3 className="font-display" style={{ fontSize: '20px', marginTop: '6px' }}>{c.packageTier?.toUpperCase()} Retainer</h3>
                    <span style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700 }}>{c.monthlyPrice} {c.currency} / month</span>
                  </div>
                </div>

                {/* Deliverables List */}
                {c.deliverables && c.deliverables.length > 0 && (
                  <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>DELIVERED RENDERS:</span>
                    {c.deliverables.map((d: any) => (
                      <div key={d._id} style={{ padding: '12px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Render #{d.sequenceNumber}: {d.title || 'Video Edit'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--ink-soft)', display: 'block' }}>Delivered: {new Date(d.deliveredAt || d.createdAt).toLocaleDateString()}</span>
                        </div>
                        {d.deliveryUrl && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href={d.deliveryUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="secondary" size="small" iconRight={IconExternalLink}>View</Button>
                            </a>
                            {d.status === 'delivered' && (
                              <Button variant="primary" size="small" iconRight={IconCheck} onClick={() => handleApproveDeliverable(c._id, d._id)}>Approve</Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ALL PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <h2 className="font-display" style={{ fontSize: '24px', color: 'var(--ink)' }}>
            All Projects & Historical Work
          </h2>
          {projects.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)' }}>No project history found.</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div key={proj._id} style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>{proj.status.replace('_', ' ').toUpperCase()}</Badge>
                  <h4 className="font-display" style={{ fontSize: '16px', marginTop: '6px', color: 'var(--ink)' }}>{proj.editingStyle}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)' }}>{proj.price} {proj.currency}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '640px', margin: '0 auto', display: 'grid', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>Account Settings & Profile</h3>

            {/* Profile Avatar Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={profileName} style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(201, 160, 107, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '28px', border: '2px solid var(--accent-gold)' }}>
                  {profileName ? profileName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Dropzone onFileSelect={handleAvatarUpload} label="Upload Profile Photo" sublabel="Supports JPG, PNG (Max 5MB)" />
                {uploadingAvatar && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-gold)' }}>
                    Uploading photo: {avatarProgress}%
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '16px' }}>
              <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
              <Input label="Email Address" value={user?.email || ''} disabled helperText="Email is managed via your account provider." />
              <Input label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Required only if updating password" />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
              <Button type="submit" variant="primary" isLoading={savingProfile}>Save Profile Changes</Button>
            </form>
          </div>

          {/* Telegram Account Connection Status Box */}
          <div style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)' }}>
            <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '8px' }}>Telegram Account Integration</h4>
            {user?.telegramChatId ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Badge variant="success">CONNECTED</Badge>
                  <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '4px' }}>Chat ID: {user.telegramChatId}</p>
                </div>
                <Button variant="secondary" size="small" isLoading={unlinkingTelegram} onClick={handleUnlinkTelegram}>Disconnect Account</Button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginBottom: '12px' }}>Your Telegram account is not connected. Connect now to receive instant render updates.</p>
                <Button variant="primary" size="small" onClick={() => window.location.href = '/telegram-link'}>Connect Telegram</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Rate Video Delivery">
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <StarRating rating={ratingStars} onChange={setRatingStars} readOnly={false} size={28} />
          </div>
          <Textarea label="Your Experience & Review" placeholder="Share your feedback on the video edit quality..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
          <Button variant="primary" fullWidth isLoading={submitting} onClick={handleSubmitRating}>Submit Review</Button>
        </div>
      </Modal>

      {/* REVISION MODAL */}
      <Modal isOpen={revisionModalOpen} onClose={() => setRevisionModalOpen(false)} title="Request Video Revision">
        <form onSubmit={handleRequestRevision} style={{ display: 'grid', gap: '16px' }}>
          <Textarea label="Revision Notes" placeholder="Specify exact timestamps & changes needed..." value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)} required />
          <Button type="submit" variant="primary" fullWidth isLoading={submitting}>Send Revision Request</Button>
        </form>
      </Modal>

      {/* DECLINE MODAL */}
      <Modal isOpen={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Proposal">
        <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '20px' }}>Are you sure you want to decline this proposal?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setDeclineModalOpen(false)}>Cancel</Button>
          <Button variant="primary" isLoading={submitting} onClick={handleDeclineProposal}>Decline Proposal</Button>
        </div>
      </Modal>
    </div>
  );
};

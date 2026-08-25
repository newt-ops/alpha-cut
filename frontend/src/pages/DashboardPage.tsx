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
import { ClientLayout } from '@components/layout/ClientLayout';
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
  IconEye,
  IconTelegram,
  IconStar,
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
  const [projectFilterTab, setProjectFilterTab] = useState('all');
  const [contractFilterTab, setContractFilterTab] = useState('all');

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Expanded Contained Cards Tracking State
  const [expandedProjectIds, setExpandedProjectIds] = useState<Record<string, boolean>>({});
  const [expandedContractIds, setExpandedContractIds] = useState<Record<string, boolean>>({});

  const toggleExpandProject = (id: string) => {
    setExpandedProjectIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandContract = (id: string) => {
    setExpandedContractIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  // Client-scoped Ratings filter matching Rating model schema (clientId)
  const userRatings = ratings.filter((r) => {
    const rClientId = (r.clientId?._id || r.clientId || '').toString();
    const currentUserId = (user?._id || '').toString();
    return (
      (currentUserId && rClientId === currentUserId) ||
      (user?.name && r.clientName?.toLowerCase() === user.name.toLowerCase()) ||
      (user?.email && r.clientEmail?.toLowerCase() === user.email.toLowerCase())
    );
  });

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
  const handleApproveDeliverable = async (contract: any, deliverableId: string) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/contracts/${contract._id}/deliverables/${deliverableId}/approve`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Video deliverable approved! Rating unlocked.', type: 'success' });
        fetchDashboardData();
        setSelectedContract(contract);
        setContractRateModalOpen(true);
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

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast({ message: 'All notifications marked as read', type: 'success' });
    } catch (err) {}
  };

  return (
    <ClientLayout
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      notifications={notifications}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
    >

      {/* OVERVIEW TAB — Studio Dashboard Hub */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '28px' }}>

          {/* Quick Metrics & Telegram Status Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                ACTIVE PROJECTS
              </span>
              <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>
                {activeProjects.length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                Ongoing video edits
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                RETAINER CONTRACTS
              </span>
              <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>
                {contracts.filter((c) => c.status === 'active' || c.status === 'proposed').length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                Monthly engagements
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                DELIVERED RENDERS
              </span>
              <span className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>
                {projects.filter((p) => p.status === 'delivered' || p.status === 'completed').length}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '2px' }}>
                Ready & approved exports
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: user?.telegramChatId ? '1px solid var(--accent-gold)' : '1px solid var(--line)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                TELEGRAM ALERTS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <Badge variant={user?.telegramChatId ? 'success' : 'gold'}>
                  {user?.telegramChatId ? 'CONNECTED ✓' : 'NOT LINKED'}
                </Badge>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginTop: '6px' }}>
                {user?.telegramChatId ? 'Instant render alerts active' : 'Click Profile to link'}
              </span>
            </div>
          </div>

          {/* Active Retainer Contracts Section */}
          {contracts.filter((c) => c.status === 'proposed' || c.status === 'active').length > 0 && (
            <div>
              <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--ink)', fontWeight: 800 }}>
                Active Retainer Contracts ({contracts.filter((c) => c.status === 'proposed' || c.status === 'active').length})
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '20px' }}>
                Your ongoing monthly retainer engagements and handed-over deliverables.
              </p>

              <div style={{ display: 'grid', gap: '16px' }}>
                {contracts.filter((c) => c.status === 'proposed' || c.status === 'active').map((contract) => {
                  const delCount = contract.deliveredCount || 0;
                  const planned = contract.totalVideosPlanned || 8;
                  const pct = Math.min(100, Math.round((delCount / planned) * 100));
                  const isExpanded = !!expandedContractIds[contract._id];

                  return (
                    <div
                      key={contract._id}
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--line)',
                        boxShadow: 'var(--shadow-sm)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* COMPACT ROW HEADER */}
                      <div
                        style={{
                          padding: '18px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '16px',
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? 'var(--bg)' : 'transparent',
                          borderBottom: isExpanded ? '1px solid var(--line)' : 'none',
                        }}
                        onClick={() => toggleExpandContract(contract._id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <Badge variant={contract.status === 'active' ? 'success' : 'gold'}>
                            RETAINER • {contract.status.toUpperCase()}
                          </Badge>
                          <div>
                            <h3 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', margin: 0, fontWeight: 800 }}>
                              {contract.packageTier?.toUpperCase()} Retainer ({contract.frequency || 'Monthly'})
                            </h3>
                            <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                              {contract.monthlyPrice ? `${contract.monthlyPrice.toLocaleString()} ${contract.currency}` : 'Custom Rate'} / mo • ({delCount}/{planned} Videos Handed Over)
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {contract.status === 'proposed' && (
                            <>
                              <Button
                                variant="secondary"
                                size="small"
                                isLoading={submitting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeclineContract(contract._id);
                                }}
                              >
                                Decline
                              </Button>

                              <Button
                                variant="primary"
                                size="small"
                                iconRight={IconCheck}
                                isLoading={submitting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptContract(contract._id);
                                }}
                              >
                                Accept Terms
                              </Button>
                            </>
                          )}

                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                            {isExpanded ? 'Hide Deliverables ▲' : 'View Progress ▼'}
                          </span>
                        </div>
                      </div>

                      {/* EXPANDABLE DELIVERABLES PROGRESS BODY */}
                      {isExpanded && (
                        <div style={{ padding: '20px 24px', backgroundColor: 'var(--bg)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                            <span>Deliverables Handed Over: {delCount} of {planned} Videos</span>
                            <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>{pct}%</span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: 'var(--surface)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div>
                <h2 className="font-display" style={{ fontSize: '24px', margin: 0, color: 'var(--ink)', fontWeight: 800 }}>
                  Proposals & Video Projects ({projects.filter((p) => projectFilterTab === 'all' || p.status === projectFilterTab).length})
                </h2>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', margin: '4px 0 0 0' }}>
                  Click any project card to expand full milestone stepper and video render controls.
                </p>
              </div>

              {/* Filter Tabs Bar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Projects' },
                  { id: 'proposal_sent', label: 'Proposals Sent' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'delivered', label: 'Work Delivered' },
                  { id: 'completed', label: 'Completed' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProjectFilterTab(tab.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: projectFilterTab === tab.id ? 'var(--accent-gold)' : 'var(--surface)',
                      color: projectFilterTab === tab.id ? '#170B06' : 'var(--ink-soft)',
                      border: `1px solid ${projectFilterTab === tab.id ? 'var(--accent-gold)' : 'var(--line)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {projects.filter((p) => projectFilterTab === 'all' || p.status === projectFilterTab).length === 0 ? (
              <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No video projects matching the selected status filter.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {projects.filter((p) => projectFilterTab === 'all' || p.status === projectFilterTab).map((proj) => {
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
                            <div style={{ padding: isMobile ? '16px 12px' : '24px 28px', backgroundColor: 'var(--bg)', display: 'grid', gap: isMobile ? '14px' : '20px' }}>
                              {/* Milestone Stepper */}
                              <div style={{ padding: isMobile ? '12px 10px' : '20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', overflowX: 'auto' }}>
                                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '10px', letterSpacing: '0.06em' }}>
                                  PRODUCTION MILESTONE PROGRESS:
                                </span>
                                <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
                              </div>

                              {/* Specs Summary Grid */}
                              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '8px' : '16px' }}>
                                <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                                  <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>CONTENT FORMAT</span>
                                  <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.contentLength === 'short' ? '9:16 Short-Form' : '16:9 Long-Form'}</span>
                                </div>

                                <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                                  <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>PACKAGE TIER</span>
                                  <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.packageTier ? proj.packageTier.toUpperCase() : 'STANDARD'}</span>
                                </div>

                                <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                                  <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>AGREED PRICE</span>
                                  <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--accent-gold)' }}>{proj.price ? `${proj.price.toLocaleString()} ${proj.currency}` : 'Custom Quote'}</span>
                                </div>

                                <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                                  <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>TARGET DEADLINE</span>
                                  <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'TBD'}</span>
                                </div>
                              </div>

                              {/* Proposal Scope & Brief */}
                              <div style={{ padding: isMobile ? '12px 14px' : '16px 18px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                                <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                                  EDITING BRIEF & PRODUCTION NOTES:
                                </span>
                                <p style={{ fontSize: isMobile ? '12.5px' : '13.5px', color: 'var(--ink)', margin: 0, lineHeight: 1.6 }}>
                                  {proj.referenceBrief || proj.notes || proj.videoNotes || 'Standard retention-driven video editing brief.'}
                                </p>

                                {proj.briefAttachmentUrl && (
                                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                                    <a href={proj.briefAttachmentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                      <span>Download Brief Asset Attachment 📎</span>
                                    </a>
                                  </div>
                                )}
                              </div>

                              {/* Render Delivery Link / Revisions */}
                              {(proj.deliverableUrl || proj.deliveryLink) ? (
                                <div
                                  style={{
                                    padding: isMobile ? '14px 12px' : '18px 20px',
                                    backgroundColor: 'rgba(201, 160, 107, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1.5px solid var(--accent-gold)',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isMobile ? 'stretch' : 'center',
                                    gap: '14px',
                                  }}
                                >
                                  <div>
                                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                                      DELIVERED HIGH-BITRATE VIDEO RENDER:
                                    </span>
                                    <a
                                      href={proj.deliverableUrl || proj.deliveryLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: 'var(--accent-gold)',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: 'rgba(201, 160, 107, 0.12)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(201, 160, 107, 0.3)',
                                        wordBreak: 'break-all',
                                      }}
                                    >
                                      <IconEye size={14} color="var(--accent-gold)" />
                                      <span>View Video Render Link</span>
                                    </a>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                                    <a href={proj.deliverableUrl || proj.deliveryLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                                      <Button variant="secondary" size="small" iconRight={IconExternalLink} fullWidth={isMobile}>
                                        Preview Render ↗
                                      </Button>
                                    </a>

                                    <Button
                                      variant="secondary"
                                      size="small"
                                      fullWidth={isMobile}
                                      onClick={() => {
                                        setSelectedProject(proj);
                                        setRevisionModalOpen(true);
                                      }}
                                    >
                                      Request Revision
                                    </Button>

                                    {proj.status === 'delivered' && (
                                      <Button
                                        variant="primary"
                                        size="small"
                                        iconRight={IconCheck}
                                        isLoading={submitting}
                                        fullWidth={isMobile}
                                        onClick={() => handleApproveDelivery(proj._id)}
                                      >
                                        Approve Delivery
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ padding: '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line)', textAlign: 'center' }}>
                                  <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0 }}>
                                    Video render link will appear here as soon as editing & motion polish are completed by Amir & Aymen.
                                  </p>
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
        <div style={{ display: 'grid', gap: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                My Retainer Engagements ({contracts.filter((c) => contractFilterTab === 'all' || c.status === contractFilterTab).length})
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '4px 0 0 0' }}>
                Track ongoing monthly video production, review handed-over renders, and approve deliverables.
              </p>
            </div>

            {/* Contract Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Retainers' },
                { id: 'active', label: 'Active Retainers' },
                { id: 'proposed', label: 'Proposed Terms' },
                { id: 'completed', label: 'Completed' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContractFilterTab(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: contractFilterTab === tab.id ? 'var(--accent-gold)' : 'var(--surface)',
                    color: contractFilterTab === tab.id ? '#170B06' : 'var(--ink-soft)',
                    border: `1px solid ${contractFilterTab === tab.id ? 'var(--accent-gold)' : 'var(--line)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {contracts.filter((c) => contractFilterTab === 'all' || c.status === contractFilterTab).length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: '48px 32px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Badge variant="gold">MONTHLY PRODUCTION RETAINERS</Badge>
              <h3 className="font-display" style={{ fontSize: '24px', fontWeight: 800, marginTop: '12px' }}>
                No Retainer Contracts Found
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '14.5px', maxWidth: '520px', margin: '10px auto 24px auto', lineHeight: 1.6 }}>
                Interested in predictable monthly video volume? Contact Amir & Aymen on Telegram to lock in a custom retainer package.
              </p>
              <a href="https://t.me/Leo_rnn" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="primary" iconRight={IconExternalLink}>
                  Request Custom Retainer Proposal
                </Button>
              </a>
            </div>
          ) : (
            contracts.filter((c) => contractFilterTab === 'all' || c.status === contractFilterTab).map((c) => {
              const delCount = c.deliveredCount || (c.deliverables ? c.deliverables.length : 0);
              const planned = c.totalVideosPlanned || 8;
              const pct = Math.min(100, Math.round((delCount / planned) * 100));
              const isExpanded = !!expandedContractIds[c._id];

              return (
                <div
                  key={c._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: c.status === 'active' ? '2px solid var(--accent-gold)' : '1px solid var(--line)',
                    boxShadow: c.status === 'active' ? '0 10px 30px -10px rgba(201, 160, 107, 0.2)' : 'var(--shadow-sm)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Compact Header Summary */}
                  <div
                    style={{
                      padding: '24px 28px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'var(--bg)' : 'transparent',
                      borderBottom: isExpanded ? '1px solid var(--line)' : 'none',
                    }}
                    onClick={() => toggleExpandContract(c._id)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Badge variant={c.status === 'active' ? 'success' : c.status === 'proposed' ? 'gold' : 'surface'}>
                          RETAINER • {c.status.toUpperCase()}
                        </Badge>
                        <span className="font-mono" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                          ID: {c._id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
                        {c.packageTier?.toUpperCase()} RETAINER ({c.frequency || 'Monthly'})
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 700, marginTop: '4px' }}>
                        {c.monthlyPrice ? `${c.monthlyPrice.toLocaleString()} ${c.currency}` : 'Custom Rate'} / month • Deliverables: {delCount}/{planned} Videos ({pct}%)
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {c.status === 'proposed' && (
                        <>
                          <Button
                            variant="secondary"
                            size="small"
                            isLoading={submitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeclineContract(c._id);
                            }}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="small"
                            iconRight={IconCheck}
                            isLoading={submitting}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptContract(c._id);
                            }}
                          >
                            Accept Terms
                          </Button>
                        </>
                      )}

                      <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                        {isExpanded ? 'Hide Deliverables ▲' : 'View Renders ▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Deliverables Log & Progress */}
                  {isExpanded && (
                    <div style={{ padding: '28px', display: 'grid', gap: '24px' }}>
                      {/* Progress Bar */}
                      <div style={{ padding: '18px 20px', backgroundColor: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                          <span>Handed-Over Deliverables Progress</span>
                          <span className="font-mono" style={{ color: 'var(--accent-gold)' }}>
                            {delCount} of {planned} Videos ({pct}%)
                          </span>
                        </div>
                        <div style={{ height: '10px', backgroundColor: 'var(--surface)', borderRadius: '100px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 600ms ease' }} />
                        </div>
                      </div>

                      {/* Renders Log */}
                      <div>
                        <span className="font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.08em', display: 'block', marginBottom: '14px' }}>
                          DELIVERED VIDEO RENDERS LOG ({c.deliverables ? c.deliverables.length : 0}):
                        </span>

                        {!c.deliverables || c.deliverables.length === 0 ? (
                          <div style={{ padding: '20px', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line)', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: 0 }}>
                              No video renders uploaded for this retainer cycle yet. Edits will appear here as soon as Amir & Aymen complete them.
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {c.deliverables.map((d: any, idx: number) => (
                              <div
                                key={d._id || idx}
                                style={{
                                  padding: '16px 20px',
                                  backgroundColor: 'var(--bg)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--line)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '14px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <div
                                    style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(201, 160, 107, 0.15)',
                                      border: '1px solid var(--accent-gold)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'var(--accent-gold)',
                                      fontWeight: 800,
                                      fontSize: '13px',
                                      fontFamily: 'var(--font-mono)',
                                    }}
                                  >
                                    #{d.sequenceNumber || idx + 1}
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', display: 'block' }}>
                                      {d.title || `Video Render #${d.sequenceNumber || idx + 1}`}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                                      Delivered: {new Date(d.deliveredAt || d.createdAt || Date.now()).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>

                                {d.deliveryUrl && (
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <a href={d.deliveryUrl} target="_blank" rel="noopener noreferrer">
                                      <Button variant="secondary" size="small" iconRight={IconExternalLink}>
                                        Preview Render
                                      </Button>
                                    </a>
                                    {d.status === 'delivered' && (
                                      <Button
                                        variant="primary"
                                        size="small"
                                        iconRight={IconCheck}
                                        onClick={() => handleApproveDeliverable(c, d._id)}
                                      >
                                        Approve Render
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ALL PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>
              All Projects & Historical Edits ({projects.length})
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--ink-soft)', marginTop: '4px' }}>
              Complete archive of your video editing orders, proposals, and delivered renders.
            </p>
          </div>

          {projects.length === 0 ? (
            <div style={{ backgroundColor: 'var(--surface)', padding: '48px 32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <p style={{ color: 'var(--ink-soft)', fontSize: '15px', margin: 0 }}>No project history found on record.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {projects.map((proj) => {
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
                    }}
                  >
                    {/* COMPACT ROW HEADER */}
                    <div
                      style={{
                        padding: '18px 24px',
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
                        <Badge variant={proj.status === 'completed' ? 'success' : proj.status === 'proposal_sent' ? 'gold' : proj.status === 'delivered' ? 'maroon' : 'surface'}>
                          {proj.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div>
                          <h4 className="font-display" style={{ fontSize: '17px', color: 'var(--ink)', margin: 0, fontWeight: 800 }}>
                            {proj.editingStyle}
                          </h4>
                          <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                            Deadline: {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'TBD'} • ID: {proj._id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          {proj.price ? `${proj.price.toLocaleString()} ${proj.currency}` : 'Quote'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--ink-soft)', fontWeight: 600 }}>
                          {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                        </span>
                      </div>
                    </div>

                    {/* EXPANDABLE BODY CONTENT */}
                    {isExpanded && (
                      <div style={{ padding: isMobile ? '16px 12px' : '24px 28px', backgroundColor: 'var(--bg)', display: 'grid', gap: isMobile ? '14px' : '20px' }}>
                        {/* Milestone Stepper */}
                        <div style={{ padding: isMobile ? '12px 10px' : '20px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', overflowX: 'auto' }}>
                          <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '10px', letterSpacing: '0.06em' }}>
                            PRODUCTION MILESTONE PROGRESS:
                          </span>
                          <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
                        </div>

                        {/* Specs Summary Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? '8px' : '16px' }}>
                          <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>CONTENT FORMAT</span>
                            <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.contentLength === 'short' ? '9:16 Short-Form' : '16:9 Long-Form'}</span>
                          </div>

                          <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>PACKAGE TIER</span>
                            <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.packageTier ? proj.packageTier.toUpperCase() : 'STANDARD'}</span>
                          </div>

                          <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>AGREED PRICE</span>
                            <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--accent-gold)' }}>{proj.price ? `${proj.price.toLocaleString()} ${proj.currency}` : 'Custom Quote'}</span>
                          </div>

                          <div style={{ padding: isMobile ? '10px' : '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                            <span className="font-mono" style={{ fontSize: '9.5px', color: 'var(--accent-gold)', display: 'block', marginBottom: '2px' }}>TARGET DEADLINE</span>
                            <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight: 800, color: 'var(--ink)' }}>{proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'TBD'}</span>
                          </div>
                        </div>

                        {/* Proposal Scope & Brief */}
                        <div style={{ padding: isMobile ? '12px 14px' : '16px 18px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                          <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                            EDITING BRIEF & PRODUCTION NOTES:
                          </span>
                          <p style={{ fontSize: isMobile ? '12.5px' : '13.5px', color: 'var(--ink)', margin: 0, lineHeight: 1.6 }}>
                            {proj.referenceBrief || proj.notes || proj.videoNotes || 'Standard retention-driven video editing brief.'}
                          </p>

                          {proj.briefAttachmentUrl && (
                            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
                              <a href={proj.briefAttachmentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span>Download Brief Asset Attachment 📎</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Render Delivery Link / Revisions / Approvals */}
                        {(proj.deliverableUrl || proj.deliveryLink) ? (
                          <div
                            style={{
                              padding: isMobile ? '14px 12px' : '18px 20px',
                              backgroundColor: 'rgba(201, 160, 107, 0.1)',
                              borderRadius: 'var(--radius-md)',
                              border: '1.5px solid var(--accent-gold)',
                              display: 'flex',
                              flexDirection: isMobile ? 'column' : 'row',
                              justifyContent: 'space-between',
                              alignItems: isMobile ? 'stretch' : 'center',
                              gap: '14px',
                            }}
                          >
                            <div>
                              <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
                                DELIVERED HIGH-BITRATE VIDEO RENDER:
                              </span>
                              <a
                                href={proj.deliverableUrl || proj.deliveryLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: 'var(--accent-gold)',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: 'rgba(201, 160, 107, 0.12)',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(201, 160, 107, 0.3)',
                                  wordBreak: 'break-all',
                                }}
                              >
                                <IconEye size={14} color="var(--accent-gold)" />
                                <span>View Video Render Link</span>
                              </a>
                            </div>

                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                              <a href={proj.deliverableUrl || proj.deliveryLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', width: isMobile ? '100%' : 'auto' }}>
                                <Button variant="secondary" size="small" iconRight={IconExternalLink} fullWidth={isMobile}>
                                  Preview Render ↗
                                </Button>
                              </a>

                              <Button
                                variant="secondary"
                                size="small"
                                fullWidth={isMobile}
                                onClick={() => {
                                  setSelectedProject(proj);
                                  setRevisionModalOpen(true);
                                }}
                              >
                                Request Revision
                              </Button>

                              {proj.status === 'delivered' && (
                                <Button
                                  variant="primary"
                                  size="small"
                                  iconRight={IconCheck}
                                  isLoading={submitting}
                                  fullWidth={isMobile}
                                  onClick={() => handleApproveDelivery(proj._id)}
                                >
                                  Approve Delivery
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '14px 16px', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--line)', textAlign: 'center' }}>
                            <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: 0 }}>
                              Video render link will appear here as soon as editing & motion polish are completed by Amir & Aymen.
                            </p>
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
      )}

      {/* MY REVIEWS TAB */}
      {activeTab === 'ratings' && (
        <div style={{ display: 'grid', gap: '28px' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 800, color: 'var(--ink)', margin: 0 }}>
              My Reviews & Testimonials ({userRatings.length})
            </h2>
            <p style={{ fontSize: isMobile ? '12.5px' : '14px', color: 'var(--ink-soft)', margin: '4px 0 0 0' }}>
              Your verified feedback and testimonials submitted after approving delivered video renders.
            </p>
          </div>

          {userRatings.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                padding: isMobile ? '28px 16px' : '48px 32px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Badge variant="gold">VERIFIED CLIENT FEEDBACK</Badge>
              <h3 className="font-display" style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, marginTop: '12px', color: 'var(--ink)' }}>
                No Submitted Reviews Yet
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13.5px', maxWidth: '520px', margin: '10px auto 0 auto', lineHeight: 1.6 }}>
                Rating and review prompts unlock automatically once a video edit or retainer render is delivered by Amir & Aymen and approved by you.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {userRatings.map((r) => (
                <div
                  key={r._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    padding: isMobile ? '18px 16px' : '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <StarRating rating={r.stars} readOnly />
                      <Badge variant={r.featured ? 'success' : 'gold'} size="small">
                        {r.featured ? 'FEATURED TESTIMONIAL ★' : 'VERIFIED REVIEW'}
                      </Badge>
                    </div>

                    <h4 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px 0' }}>
                      {r.editingStyle || r.projectTitle || 'Video Edit Engagement'}
                    </h4>

                    <p style={{ fontSize: '13.5px', color: 'var(--ink)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                      "{r.review || r.comment || 'Outstanding video editing and motion polish delivered on time!'}"
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                      Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      ALPHA CUT VERIFIED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'grid', gap: '28px' }}>
          {/* Main Account Settings Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              padding: '36px 32px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <Badge variant="gold">PROFILE & SECURITY</Badge>
                <h3 className="font-display" style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--ink)' }}>
                  Account Settings
                </h3>
              </div>
              <Badge variant="gold">CLIENT WORKSPACE</Badge>
            </div>

            {/* Profile Avatar Upload Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', padding: '20px', backgroundColor: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--line)' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profileName}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)', boxShadow: '0 4px 16px rgba(201, 160, 107, 0.3)' }}
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#170B06',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '32px',
                  }}
                >
                  {profileName ? profileName.charAt(0).toUpperCase() : 'C'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Dropzone onFileSelect={handleAvatarUpload} label="Upload Profile Photo" sublabel="Supports JPG, PNG (Max 5MB)" />
                {uploadingAvatar && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    Uploading photo to Cloudinary: {avatarProgress}%
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '20px' }}>
              <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
              <Input label="Email Address" value={user?.email || ''} disabled helperText="Email is managed via your primary login provider." />
              <Input label="Current Password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Required only if updating password" />
              <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" />
              
              <div style={{ marginTop: '8px' }}>
                <Button type="submit" variant="primary" fullWidth size="large" isLoading={savingProfile}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Telegram Account Integration Card */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              padding: '28px 32px',
              borderRadius: 'var(--radius-lg)',
              border: user?.telegramChatId ? '2px solid var(--accent-gold)' : '1px solid var(--line)',
              boxShadow: user?.telegramChatId ? '0 10px 30px -10px rgba(201, 160, 107, 0.2)' : 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, display: 'block', letterSpacing: '0.06em' }}>
                  TELEGRAM REAL-TIME ALERTS:
                </span>
                <h4 className="font-display" style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: 'var(--ink)' }}>
                  Telegram Bot Integration
                </h4>
              </div>
              <Badge variant={user?.telegramChatId ? 'success' : 'gold'}>
                {user?.telegramChatId ? 'CONNECTED ✓' : 'UNLINKED'}
              </Badge>
            </div>

            {user?.telegramChatId ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '16px', padding: '16px 20px', backgroundColor: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)', display: 'block' }}>
                    Linked Telegram Account
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                    Chat ID: {user.telegramChatId}
                  </span>
                </div>
                <Button variant="secondary" size="small" isLoading={unlinkingTelegram} onClick={handleUnlinkTelegram}>
                  Disconnect Account
                </Button>
              </div>
            ) : (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Connect your Telegram account to receive instant notifications whenever proposal offers, editing deliverables, and render updates are ready.
                </p>
                <Button variant="primary" size="small" iconRight={IconExternalLink} onClick={() => window.location.href = '/telegram-link'}>
                  Connect Telegram Account
                </Button>
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
    </ClientLayout>
  );
};

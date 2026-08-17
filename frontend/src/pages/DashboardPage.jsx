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
} from '@icons/icons';

export const DashboardPage = () => {
  const { user, apiFetch, unlinkTelegram, updateProfile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
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
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, notifRes, ratRes] = await Promise.all([
        apiFetch('/api/projects').catch(() => ({ success: false, projects: [] })),
        apiFetch('/api/notifications').catch(() => ({ success: false, notifications: [] })),
        apiFetch('/api/ratings').catch(() => ({ success: false, ratings: [] })),
      ]);

      if (projRes.success) setProjects(projRes.projects);
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

      {/* NOTION CALENDAR SCHEDULE TAB */}
      {activeTab === 'calendar' && (
        <NotionCalendar
          projects={projects}
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

      {/* Rating Modal */}
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
    </div>
  );
};

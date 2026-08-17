import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Stepper } from '@components/ui/Stepper';
import { Modal } from '@components/ui/Modal';
import { StarRating } from '@components/ui/StarRating';
import { Input, Textarea } from '@components/ui/Input';
import { Dropzone } from '@components/ui/Dropzone';
import { Tabs } from '@components/ui/Tabs';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@components/ui/Toast';
import { IconCheck, IconClose, IconExternalLink, IconSparkles, IconUser, IconZap, IconStar, IconFileText } from '@icons/icons';

export const DashboardPage = () => {
  const { user, apiFetch, updateProfile, generateTelegramToken, unlinkTelegram } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProject, setSelectedProject] = useState(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [unlinkingTelegram, setUnlinkingTelegram] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, notifRes] = await Promise.all([
        apiFetch('/api/projects'),
        apiFetch('/api/notifications'),
      ]);

      if (projRes.success) setProjects(projRes.projects);
      if (notifRes.success) setNotifications(notifRes.notifications);
    } catch (err) {
      toast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter all active projects / proposals
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
    { label: 'Proposal Sent' },
    { label: 'In Progress' },
    { label: 'Work Delivered' },
    { label: 'Approved & Completed' },
  ];

  // Actions
  const handleAcceptProposal = async (projectId) => {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
      if (res.success) {
        toast({ message: 'Proposal accepted! Project is now in progress.', type: 'success' });
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
        toast({ message: 'Delivery approved! Rating is now unlocked.', type: 'success' });
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
      toast({ message: 'Please write a brief review before submitting.', type: 'error' });
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
    { id: 'projects', label: 'My Projects' },
    { id: 'profile', label: 'Account Profile' },
  ];

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
                backgroundColor: 'rgba(201, 160, 107, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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

      {/* OVERVIEW TAB — Renders ALL Active Projects simultaneously */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '4px', color: 'var(--ink)' }}>Active Proposals & Projects ({activeProjects.length})</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '24px' }}>Inspect project status, accept terms offers, or approve video deliverables.</p>

            {activeProjects.length === 0 ? (
              <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>You currently have no active proposals or ongoing video projects.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '24px' }}>
                {activeProjects.map((proj) => (
                  <div
                    key={proj._id}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--line)',
                      padding: '32px 28px',
                      boxShadow: 'var(--shadow)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>PROJECT SPECIFICATION</span>
                        <h3 className="font-display" style={{ fontSize: '24px', marginTop: '4px' }}>
                          {proj.editingStyle}
                        </h3>
                      </div>
                      <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>
                        {proj.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                      <Stepper steps={stepperSteps} currentStep={getStepIndex(proj.status)} />
                    </div>

                    {/* Contextual Action Banner for THIS specific project */}
                    <div
                      style={{
                        backgroundColor: 'var(--bg)',
                        padding: '24px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 600 }}>
                          Project Terms: {proj.price} {proj.currency} ({proj.packageTier?.toUpperCase()})
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          Deadline: {new Date(proj.deadline).toLocaleDateString()}
                        </p>
                        {proj.referenceBrief && (
                          <p style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px', fontStyle: 'italic' }}>
                            Brief / Reference: {proj.referenceBrief}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {proj.status === 'proposal_sent' && (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setSelectedProject(proj);
                                setDeclineModalOpen(true);
                              }}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              iconRight={IconCheck}
                              isLoading={submitting}
                              onClick={() => handleAcceptProposal(proj._id)}
                            >
                              Accept Proposal
                            </Button>
                          </>
                        )}

                        {proj.status === 'delivered' && (
                          <Button
                            variant="primary"
                            iconRight={IconSparkles}
                            isLoading={submitting}
                            onClick={() => handleApproveDelivery(proj._id)}
                          >
                            Approve Delivery & Rate
                          </Button>
                        )}

                        {proj.status === 'in_progress' && (
                          <Badge variant="gold">WORK IN PROGRESS (50%)</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* In-App Notifications Feed */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '28px',
            }}
          >
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>
              Notification Feed
            </h3>
            {notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IconZap size={18} color="var(--accent-gold)" />
                      <span>{n.message}</span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>No new notifications.</p>
            )}
          </div>
        </div>
      )}

      {/* MY PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--line)',
                padding: '48px 32px',
                textAlign: 'center',
                maxWidth: '640px',
                margin: '0 auto',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(201, 160, 107, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  color: 'var(--accent-gold)',
                }}
              >
                <IconFileText size={28} />
              </div>
              <h3 className="font-display" style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--ink)' }}>
                No Project History Yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '24px' }}>
                When the agency team issues a video proposal for your channel or brand, your project specifications and editing terms will appear here automatically.
              </p>
              <Badge variant="gold">Awaiting Initial Proposal</Badge>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <Badge variant={proj.status === 'completed' ? 'success' : 'gold'}>
                        {proj.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                        {new Date(proj.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '8px' }}>
                      {proj.editingStyle}
                    </h3>

                    <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '16px' }}>
                      Tier: <strong>{proj.packageTier?.toUpperCase()}</strong> ({proj.contentLength?.toUpperCase()})
                    </p>

                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '16px' }}>
                      {proj.price} {proj.currency}
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                    {proj.status === 'completed' && proj.rated && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-gold)' }}>
                        <IconStar size={16} filled color="var(--accent-gold)" />
                        <span>Project Reviewed & Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACCOUNT PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '32px' }}>
          <form
            onSubmit={handleSaveProfile}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '32px 28px',
            }}
          >
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>
              Account Settings & Photo
            </h3>

            {/* Profile Avatar Dropzone */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
                Profile Photo (Cloudinary)
              </label>
              <Dropzone
                onFileSelect={handleAvatarUpload}
                label={uploadingAvatar ? 'Uploading to Cloudinary...' : 'Drag & drop profile photo here'}
                sublabel="Supports PNG, JPG (up to 5MB)"
              />
            </div>

            <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
            <Input label="Email Address" value={user?.email || ''} disabled helperText="Email address cannot be changed." />

            {user?.authProvider === 'local' && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Change Password (Optional)</h4>
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Button type="submit" variant="primary" fullWidth isLoading={savingProfile} iconRight={IconCheck}>
                Save Profile Changes
              </Button>
            </div>
          </form>

          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '32px 28px',
            }}
          >
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '12px' }}>
              Telegram Notifications
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '20px' }}>
              Status: {user?.telegramChatId ? <Badge variant="success">CONNECTED</Badge> : <Badge variant="maroon">DISCONNECTED</Badge>}
            </p>
            {user?.telegramChatId ? (
              <Button
                variant="secondary"
                isLoading={unlinkingTelegram}
                onClick={handleUnlinkTelegram}
              >
                Disconnect Telegram Account
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={async () => {
                  const tokenRes = await generateTelegramToken();
                  window.open(tokenRes.deepLinkUrl, '_blank');
                }}
              >
                Connect Telegram Account
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      <Modal isOpen={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Proposal">
        <p style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          Are you sure you want to decline this proposal? This action will notify the agency admin team.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setDeclineModalOpen(false)}>Cancel</Button>
          <Button variant="primary" isLoading={submitting} onClick={handleDeclineProposal}>Confirm Decline</Button>
        </div>
      </Modal>

      {/* Rating & Review Modal */}
      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Rate Your Completed Edit">
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <span style={{ fontSize: '14px', color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
            How satisfied are you with the final video deliverable?
          </span>
          <StarRating rating={ratingStars} onChange={setRatingStars} readOnly={false} size={28} />
        </div>

        <Textarea
          label="Written Review"
          placeholder="Share your feedback on pacing, kinetic typography, and communication..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
        />

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setRateModalOpen(false)}>Skip for Now</Button>
          <Button variant="primary" isLoading={submitting} onClick={handleSubmitRating} iconRight={IconSparkles}>
            Submit Review
          </Button>
        </div>
      </Modal>
    </div>
  );
};

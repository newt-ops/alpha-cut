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
import { customFetch } from '../utils/api';
import { IconCheck, IconClose, IconExternalLink, IconSparkles, IconUser, IconZap, IconStar, IconFileText } from '@icons/icons';

export const DashboardPage = () => {
  const { user, generateTelegramToken, checkAuthStatus } = useAuth();
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

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, notifRes] = await Promise.all([
        customFetch('/api/projects'),
        customFetch('/api/notifications'),
      ]);

      if (projRes.success) setProjects(projRes.projects);
      if (notifRes.success) setNotifications(notifRes.notifications);
    } catch (err) {
      toast({ message: 'Failed to load dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const activeProject = projects.find(
    (p) => p.status === 'proposal_sent' || p.status === 'in_progress' || p.status === 'delivered'
  ) || projects[0];

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
      const res = await customFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
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
      const res = await customFetch(`/api/projects/${selectedProject._id}/decline`, { method: 'POST' });
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
      const res = await customFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
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

  const dashboardTabs = [
    { id: 'overview', label: 'Active Overview' },
    { id: 'projects', label: 'My Projects' },
    { id: 'profile', label: 'Account Profile' },
  ];

  return (
    <div style={{ padding: '20px 0 60px 0' }} className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Badge variant="gold">Client Workspace</Badge>
          <h1 className="font-display" style={{ fontSize: '32px', marginTop: '8px' }}>
            Welcome, {user?.name}
          </h1>
        </div>
        <Tabs tabs={dashboardTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Active Project Timeline Card */}
          <div
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
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>ACTIVE PROJECT STATUS</span>
                <h3 className="font-display" style={{ fontSize: '24px', marginTop: '4px' }}>
                  {activeProject ? activeProject.editingStyle : 'No Active Projects'}
                </h3>
              </div>
              {activeProject && (
                <Badge variant={activeProject.status === 'completed' ? 'success' : 'gold'}>
                  {activeProject.status.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
            </div>

            {activeProject ? (
              <>
                <div style={{ marginBottom: '36px' }}>
                  <Stepper steps={stepperSteps} currentStep={getStepIndex(activeProject.status)} />
                </div>

                {/* Contextual Action Banner */}
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
                      Project Terms: {activeProject.price} {activeProject.currency} ({activeProject.packageTier.toUpperCase()})
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                      Deadline: {new Date(activeProject.deadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {activeProject.status === 'proposal_sent' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSelectedProject(activeProject);
                            setDeclineModalOpen(true);
                          }}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          iconRight={IconCheck}
                          isLoading={submitting}
                          onClick={() => handleAcceptProposal(activeProject._id)}
                        >
                          Accept Proposal
                        </Button>
                      </>
                    )}

                    {activeProject.status === 'delivered' && (
                      <>
                        <a href={activeProject.deliverableUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="secondary" iconRight={IconExternalLink}>
                            View Deliverable
                          </Button>
                        </a>
                        <Button
                          variant="primary"
                          iconRight={IconSparkles}
                          isLoading={submitting}
                          onClick={() => handleApproveDelivery(activeProject._id)}
                        >
                          Approve Delivery & Rate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--ink-soft)' }}>You currently have no active proposals or ongoing video projects.</p>
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
                  Tier: <strong>{proj.packageTier.toUpperCase()}</strong> ({proj.contentLength.toUpperCase()})
                </p>

                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '16px' }}>
                  {proj.price} {proj.currency}
                </div>
              </div>

              {/* Deliverable Link or Action */}
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                {proj.deliverableUrl && (
                  <a href={proj.deliverableUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '12px' }}>
                    <Button variant="secondary" fullWidth iconRight={IconExternalLink}>
                      Open Deliverable
                    </Button>
                  </a>
                )}

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

      {/* ACCOUNT PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'grid', gap: '32px' }}>
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--line)',
              padding: '32px 28px',
            }}
          >
            <h3 className="font-display" style={{ fontSize: '20px', marginBottom: '20px' }}>
              Account Settings
            </h3>
            <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            <Input label="Email Address" value={user?.email || ''} disabled helperText="Email address cannot be changed." />

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: '8px' }}>
                Profile Avatar Upload (Cloudinary)
              </label>
              <Dropzone label="Upload custom profile photo" sublabel="Supports PNG, JPG (up to 5MB)" />
            </div>
          </div>

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
            {!user?.telegramChatId && (
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
